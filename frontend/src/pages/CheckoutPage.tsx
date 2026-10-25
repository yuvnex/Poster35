import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Phone,
  User as UserIcon,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    grandTotal,
    totalQuantity,
    clearCart
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State: Only Customer Name & Mobile Contact (No Address needed)
  const [customerName, setCustomerName] = useState(() => user?.full_name || localStorage.getItem('poster35_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => user?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/posters');
    }
  }, [items, navigate]);

  // Sync user info if available
  useEffect(() => {
    if (user) {
      if (user.full_name) setCustomerName(user.full_name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Handle Direct Order Placement (No online payment, instant confirmation)
  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter the Customer Name to place your order.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please enter your mobile phone number so we can contact you regarding your posters.');
      return;
    }

    localStorage.setItem('poster35_customer_name', customerName.trim());

    setLoading(true);

    try {
      // Create Direct Order on backend (No online payment required)
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('poster35_token')}` } : {})
        },
        body: JSON.stringify({
          items: items.map((i) => ({ poster_id: i.poster.id, quantity: i.quantity })),
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_notes: customerNotes.trim(),
          fulfilment_type: 'DIRECT_ORDER',
          payment_method: 'DIRECT_ORDER'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to place order. Please try again.');
      }

      // Order created successfully!
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      clearCart();
      navigate(`/order-success/${data.orderId}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place direct order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Direct Order • No Online Payment Required
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Place Your Direct Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
          Just enter your Name & Phone number. Pay cash on delivery with 100% Free Shipping!
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleDirectOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info (Only Name & Phone) */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>Customer Details</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                  Required
                </span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold">Pay on Delivery</span>
            </div>

            <div className="space-y-4">
              {/* Customer Full Name */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                  <span>Customer Name <span className="text-amber-400">* (Required)</span></span>
                  <span className="text-[10px] text-amber-400 font-normal">Order will be placed in this name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Karthik"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      localStorage.setItem('poster35_customer_name', e.target.value);
                    }}
                    className="w-full bg-dark-900 border-2 border-amber-500/40 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 font-semibold focus:outline-none shadow-sm"
                  />
                  <UserIcon className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                  <span>Mobile Phone Number <span className="text-amber-400">* (Required)</span></span>
                  <span className="text-[10px] text-gray-400 font-normal">For delivery coordination</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98401 23456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 font-semibold focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Special Note / City or Landmark (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  City or Landmark <span className="text-gray-500">(Optional note)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Chennai / Near Central station"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Direct Order Perks Banner */}
            <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-gray-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <Check className="w-4 h-4 shrink-0" />
                <span>No online payment • No address form required</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <Check className="w-4 h-4 shrink-0" />
                <span>100% Free Doorstep Delivery across India (₹0)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
                <Check className="w-4 h-4 shrink-0" />
                <span>We will call / WhatsApp you to coordinate handoff</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & 1-Click Order Button */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-gray-800 space-y-5 sticky top-24">
            <h3 className="font-display font-bold text-base text-white flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-gray-400 font-mono">
                {totalQuantity} Posters
              </span>
            </h3>

            {/* Ordering Customer Name Indicator */}
            <div className="p-3 rounded-xl bg-dark-900 border border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">Order For:</span>
              <span className="font-bold text-amber-400 font-display truncate max-w-[170px]">
                {customerName.trim() || '(Enter your name)'}
              </span>
            </div>

            {/* Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map(({ poster, quantity }) => (
                <div key={poster.id} className="flex items-center gap-3">
                  <img
                    src={poster.image_url}
                    alt="Poster"
                    className="w-12 h-16 object-cover rounded-lg border border-gray-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{poster.category_name || 'Poster'}</p>
                    <p className="text-[11px] text-gray-400">300 GSM Matte</p>
                    <p className="text-xs font-mono text-amber-400 font-bold mt-0.5">
                      ₹{poster.price || 35} × {quantity} = ₹{(poster.price || 35) * quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-gray-800 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({totalQuantity} posters × ₹35)</span>
                <span className="font-mono text-white font-semibold">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Delivery Fee</span>
                <span className="font-mono text-emerald-400 font-bold">100% FREE (₹0)</span>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-gray-800">
                <span>Total Amount to Pay</span>
                <span className="font-display font-black text-amber-400 text-2xl">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Direct Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-display font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black flex items-center justify-center gap-2 shadow-glow-amber transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Placing Direct Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Direct Order (₹{grandTotal})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Confirmation • Cash on Delivery</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
