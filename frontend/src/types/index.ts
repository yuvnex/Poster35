export interface Poster {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  price: number;
  image_url: string;
  is_featured: number | boolean;
  is_trending: number | boolean;
  in_stock: number | boolean;
  tags?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  poster_count?: number;
  display_order?: number;
}

export interface CartItem {
  poster: Poster;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

export interface OrderItem {
  id: string;
  poster_id: string;
  poster_title_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  image_url_snapshot: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  fulfilment_type: 'PHYSICAL' | 'DIGITAL';
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  customer_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  fulfilment_status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  courier_name?: string;
  tracking_number?: string;
  created_at: string;
  items?: OrderItem[];
  item_count?: number;
}

export interface StoreConfig {
  default_poster_price: number;
  currency: string;
  currency_symbol: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  cod_enabled: boolean;
  digital_fulfilment_enabled: boolean;
  store_name: string;
  store_headline: string;
  store_subtext: string;
  store_phone: string;
  store_email: string;
}
