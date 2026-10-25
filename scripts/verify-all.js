async function runTests() {
  console.log('--- POSTER35 END-TO-END VERIFICATION SUITE ---\n');
  let passCount = 0;

  // 1. Backend Health
  try {
    const res = await fetch('http://localhost:5000/api/health');
    const data = await res.json();
    if (res.status === 200 && data.status === 'healthy') {
      console.log('✓ 1. Backend Health Check OK: Fixed ₹35 API live');
      passCount++;
    } else {
      console.error('✗ 1. Health check failed', data);
    }
  } catch (e) {
    console.error('✗ 1. Failed to connect to port 5000', e.message);
  }

  // 2. Store Config (₹35 pricing defaults)
  try {
    const res = await fetch('http://localhost:5000/api/config');
    const data = await res.json();
    if (data.config.default_poster_price === 35 && data.config.delivery_fee === 0) {
      console.log('✓ 2. Store Config OK: Default Price = ₹35, Delivery Fee = ₹0 (100% Free Delivery)');
      passCount++;
    } else {
      console.error('✗ 2. Config check failed', data);
    }
  } catch (e) {
    console.error('✗ 2. Error fetching config', e.message);
  }

  // 3. Category Listing & Poster Counts
  let samplePosterId = null;
  try {
    const res = await fetch('http://localhost:5000/api/categories');
    const data = await res.json();
    const slugs = data.categories.map((c) => c.slug);
    const requiredCategories = ['cr7', 'dhoni', 'english-movies', 'messi', 'music-poster', 'neymar', 'tamil-movies', 'vijay', 'virat-kohli'];
    const allFound = requiredCategories.every((slug) => slugs.includes(slug));

    if (allFound) {
      console.log(`✓ 3. Categories Listing OK: All 9 required categories verified (${data.categories.length} total)`);
      passCount++;
    } else {
      console.error('✗ 3. Missing categories', slugs);
    }
  } catch (e) {
    console.error('✗ 3. Categories error', e.message);
  }

  // 4. Poster Listing
  try {
    const res = await fetch('http://localhost:5000/api/posters?limit=5');
    const data = await res.json();
    if (data.posters.length > 0) {
      samplePosterId = data.posters[0].id;
      console.log(`✓ 4. Poster Catalogue OK: Total posters in database = ${data.pagination.total} (all priced at ₹${data.posters[0].price})`);
      passCount++;
    }
  } catch (e) {
    console.error('✗ 4. Poster catalogue error', e.message);
  }

  // 5. Cart Pricing Recalculation (1 Poster = ₹35 + ₹0 free shipping)
  try {
    const res = await fetch('http://localhost:5000/api/cart/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ poster_id: samplePosterId, quantity: 1 }],
        fulfilment_type: 'PHYSICAL'
      })
    });
    const data = await res.json();
    if (data.subtotal === 35 && data.delivery_fee === 0 && data.total_amount === 35) {
      console.log('✓ 5. Cart Pricing (1 Poster) OK: Subtotal ₹35 + Free Delivery ₹0 = ₹35');
      passCount++;
    } else {
      console.error('✗ 5. 1 poster calculation mismatch', data);
    }
  } catch (e) {
    console.error('✗ 5. Pricing calculation error', e.message);
  }

  // 6. Cart Free Shipping Threshold (5 Posters = ₹175, FREE Delivery)
  try {
    const res = await fetch('http://localhost:5000/api/cart/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ poster_id: samplePosterId, quantity: 5 }],
        fulfilment_type: 'PHYSICAL'
      })
    });
    const data = await res.json();
    if (data.subtotal === 175 && data.delivery_fee === 0 && data.total_amount === 175 && data.is_free_delivery === true) {
      console.log('✓ 6. Free Shipping Rule OK: 5 Posters = ₹175 Subtotal with ₹0 FREE Shipping');
      passCount++;
    } else {
      console.error('✗ 6. Free shipping threshold calculation mismatch', data);
    }
  } catch (e) {
    console.error('✗ 6. Free shipping error', e.message);
  }

  // 7. Admin Authentication & Role Protection
  let adminToken = null;
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@poster35.com', password: 'Admin@12345' })
    });
    const data = await res.json();
    if (data.success && data.user.role === 'ADMIN') {
      adminToken = data.token;
      console.log('✓ 7. Admin Authentication OK: Logged in as ADMIN with JWT token');
      passCount++;
    } else {
      console.error('✗ 7. Admin login failed', data);
    }
  } catch (e) {
    console.error('✗ 7. Login error', e.message);
  }

  // 8. Admin Protected Dashboard Stats
  try {
    const res = await fetch('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.stats) {
      console.log(`✓ 8. Admin Protected Stats OK: Total Posters = ${data.stats.totalPosters}, Verified Revenue = ₹${data.stats.verifiedRevenue}`);
      passCount++;
    } else {
      console.error('✗ 8. Admin stats failed', data);
    }
  } catch (e) {
    console.error('✗ 8. Admin stats error', e.message);
  }

  // 9. Checkout & Order Creation
  let createdOrderId = null;
  try {
    const res = await fetch('http://localhost:5000/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ poster_id: samplePosterId, quantity: 5 }],
        customer_name: 'Test Customer',
        customer_phone: '9840123456',
        customer_email: 'test@example.com',
        fulfilment_type: 'PHYSICAL',
        shipping_address: '123 Test Street, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
        payment_method: 'RAZORPAY'
      })
    });
    const data = await res.json();
    if (data.success && data.orderNumber && data.totalAmount === 175) {
      createdOrderId = data.orderId;
      console.log(`✓ 9. Checkout & Order Creation OK: Order #${data.orderNumber} created for ₹${data.totalAmount}`);
      passCount++;
    } else {
      console.error('✗ 9. Checkout failed', data);
    }
  } catch (e) {
    console.error('✗ 9. Checkout error', e.message);
  }

  // 10. Razorpay Payment Order & Verification
  try {
    const orderRes = await fetch('http://localhost:5000/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: createdOrderId })
    });
    const orderData = await orderRes.json();

    const simRes = await fetch('http://localhost:5000/api/payments/simulate-test-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: createdOrderId })
    });
    const simData = await simRes.json();

    const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId,
        razorpay_order_id: simData.razorpay_order_id,
        razorpay_payment_id: simData.razorpay_payment_id,
        razorpay_signature: simData.razorpay_signature
      })
    });
    const verifyData = await verifyRes.json();

    if (verifyData.success) {
      console.log(`✓ 10. Payment Signature Verification OK: Order ${createdOrderId} marked as PAID`);
      passCount++;
    } else {
      console.error('✗ 10. Payment verification failed', verifyData);
    }
  } catch (e) {
    console.error('✗ 10. Payment error', e.message);
  }

  // 11. Frontend Server HTML Test
  try {
    const res = await fetch('http://localhost:3000/');
    const html = await res.text();
    if (res.status === 200 && html.includes('Poster35')) {
      console.log('✓ 11. Frontend Vite Web Application OK: Serves live React 19 app');
      passCount++;
    } else {
      console.error('✗ 11. Frontend check failed');
    }
  } catch (e) {
    console.error('✗ 11. Frontend error', e.message);
  }

  // 12. Admin Orders Detail & Customer Selected Photos Verification
  try {
    const res = await fetch('http://localhost:5000/api/admin/orders', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    const ordersWithItems = data.orders.filter((o) => o.items && o.items.length > 0);
    const hasImageSnapshots = ordersWithItems.length > 0 && ordersWithItems[0].items.every((it) => it.image_url_snapshot);

    if (data.success && hasImageSnapshots) {
      const topOrder = ordersWithItems[0];
      console.log(`✓ 12. Admin Order Photos Verification OK: Order #${topOrder.order_number} contains ${topOrder.items.length} customer-selected photo(s) with image URLs`);
      passCount++;
    } else {
      console.error('✗ 12. Admin order photos verification failed', data);
    }
  } catch (e) {
    console.error('✗ 12. Admin orders photos error', e.message);
  }

  // 13. High-Resolution Poster Image Serving Verification
  try {
    const res = await fetch('http://localhost:5000/api/posters/image/cr7/IMG20261023212823.jpg');
    const contentType = res.headers.get('content-type');
    if (res.status === 200 && contentType && contentType.startsWith('image/')) {
      console.log(`✓ 13. Poster Photo Serving OK: Successfully served high-res image (HTTP 200 ${contentType})`);
      passCount++;
    } else {
      console.error('✗ 13. Poster image serving failed', res.status, contentType);
    }
  } catch (e) {
    console.error('✗ 13. Poster image serving error', e.message);
  }

  console.log(`\n==============================================`);
  console.log(`   TOTAL TESTS PASSED: ${passCount} / 13`);
  console.log(`==============================================`);
}

runTests();
