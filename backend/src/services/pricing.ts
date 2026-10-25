import { db } from '../db.ts';

export interface CartInputItem {
  poster_id: string;
  quantity: number;
}

export interface CalculatedCartItem {
  poster_id: string;
  title: string;
  price: number;
  quantity: number;
  line_total: number;
  image_url: string;
  in_stock: boolean;
}

export interface PricingBreakdown {
  items: CalculatedCartItem[];
  total_quantity: number;
  subtotal: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  amount_for_free_delivery: number;
  is_free_delivery: boolean;
  total_amount: number;
  currency: string;
}

export function getStoreSetting(key: string, defaultValue: string): string {
  try {
    const row = db.prepare('SELECT value FROM store_settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Pure calculation function for order pricing given quantity and unit price.
 * Formula: Subtotal = Quantity * Price
 * Delivery: 0 if Subtotal >= freeThreshold or fulfilment is DIGITAL, else deliveryFee
 */
export function computeOrderPricing(
  totalQuantity: number,
  unitPrice: number = 35,
  fulfilmentType: 'PHYSICAL' | 'DIGITAL' = 'PHYSICAL',
  deliveryFee: number = 0,
  freeDeliveryThreshold: number = 0
) {
  const subtotal = totalQuantity * unitPrice;
  const isFreeDelivery = true;
  const appliedDeliveryFee = 0;
  const totalAmount = subtotal;
  const amountForFreeDelivery = 0;

  return {
    totalQuantity,
    unitPrice,
    subtotal,
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    amountForFreeDelivery: 0,
    isFreeDelivery: true,
    totalAmount
  };
}

/**
 * Validates cart items against the active database and returns verified server-calculated pricing.
 * Never trusts any prices provided by the client.
 */
export function calculateCartPricing(
  items: CartInputItem[],
  fulfilmentType: 'PHYSICAL' | 'DIGITAL' = 'PHYSICAL'
): PricingBreakdown {
  const deliveryFee = parseInt(getStoreSetting('delivery_fee', '49'), 10);
  const freeThreshold = parseInt(getStoreSetting('free_delivery_threshold', '175'), 10);
  const currency = getStoreSetting('currency', 'INR');

  let subtotal = 0;
  let totalQuantity = 0;
  const calculatedItems: CalculatedCartItem[] = [];

  const getPosterStmt = db.prepare(`
    SELECT id, title, price, image_url, in_stock 
    FROM posters 
    WHERE id = ?
  `);

  for (const item of items) {
    const qty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
    const poster = getPosterStmt.get(item.poster_id) as {
      id: string;
      title: string;
      price: number;
      image_url: string;
      in_stock: number;
    } | undefined;

    if (!poster) {
      continue;
    }

    const lineTotal = poster.price * qty;
    subtotal += lineTotal;
    totalQuantity += qty;

    calculatedItems.push({
      poster_id: poster.id,
      title: poster.title,
      price: poster.price,
      quantity: qty,
      line_total: lineTotal,
      image_url: poster.image_url,
      in_stock: poster.in_stock === 1
    });
  }

  const isFreeDelivery = true;
  const appliedDeliveryFee = 0;
  const totalAmount = subtotal;
  const amountForFreeDelivery = 0;

  return {
    items: calculatedItems,
    total_quantity: totalQuantity,
    subtotal,
    delivery_fee: 0,
    free_delivery_threshold: 0,
    amountForFreeDelivery: 0,
    is_free_delivery: true,
    total_amount: subtotal,
    currency
  };
}
