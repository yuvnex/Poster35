import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Printer,
  Download,
  ArrowRight,
  Truck,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Order Not Found</h2>
        <Link to="/posters" className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm">
          Browse Posters
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print:py-0 print:space-y-4">
      {/* Success Hero Header */}
      <div className="rounded-3xl glass-panel border border-emerald-500/30 p-8 text-center space-y-4 relative overflow-hidden print:border-none print:shadow-none">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
            Order Confirmed & Placed!
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Your poster order has been received and assigned to our craft studio for printing and packaging.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-900 border border-gray-800 text-xs font-mono">
          <span className="text-gray-400">Order Reference:</span>
          <strong className="text-amber-400 text-sm">{order.order_number}</strong>
        </div>
      </div>

      {/* Fulfillment Status Timeline */}
      <div className="p-6 rounded-3xl glass-panel border border-gray-800 space-y-4 print:hidden">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Fulfilment Tracker
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-white font-semibold">Order Placed</span>
            <span className="text-[10px] text-gray-400 font-mono">Today</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                order.payment_status === 'PAID'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-dark-800 text-gray-400 border border-gray-700'
              }`}
            >
              {order.payment_status === 'PAID' ? '✓' : '2'}
            </div>
            <span className="text-white font-semibold">Payment</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {order.payment_status === 'PAID' ? 'Verified' : 'Pending COD'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                order.fulfilment_status === 'SHIPPED' || order.fulfilment_status === 'DELIVERED'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-dark-800 text-gray-400 border border-gray-700'
              }`}
            >
              3
            </div>
            <span className="text-white font-semibold">Craft Tube Pack</span>
            <span className="text-[10px] text-gray-400">1-2 Days</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                order.fulfilment_status === 'DELIVERED'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-dark-800 text-gray-400 border border-gray-700'
              }`}
            >
              4
            </div>
            <span className="text-white font-semibold">Doorstep Delivery</span>
            <span className="text-[10px] text-gray-400">3-5 Days</span>
          </div>
        </div>

        {order.tracking_number && (
          <div className="p-3 rounded-xl bg-dark-900 border border-amber-500/30 text-xs flex items-center justify-between">
            <span className="text-gray-300">
              Courier: <strong>{order.courier_name || 'Standard Post'}</strong>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              Tracking: {order.tracking_number}
            </span>
          </div>
        )}
      </div>

      {/* Items Summary */}
      <div className="p-6 rounded-3xl glass-panel border border-gray-800 space-y-4">
        <h3 className="font-display font-bold text-base text-white">
          Purchased Posters
        </h3>

        <div className="divide-y divide-gray-800">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image_url_snapshot}
                  alt={item.poster_title_snapshot}
                  className="w-12 h-16 object-cover rounded-lg border border-gray-800 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    {item.poster_title_snapshot}
                  </h4>
                  <p className="text-[11px] text-gray-400">300 GSM Matte Print • 12×18 in</p>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    ₹{item.unit_price_snapshot} × {item.quantity} = ₹{item.line_total}
                  </p>
                </div>
              </div>

              {order.fulfilment_type === 'DIGITAL' && (
                <a
                  href={item.image_url_snapshot}
                  download
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Calculation Summary */}
        <div className="pt-4 border-t border-gray-800 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal ({order.items?.reduce((s, i) => s + i.quantity, 0)} posters × ₹35)</span>
            <span className="font-mono text-white">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Delivery Fee</span>
            <span className="font-mono">
              {order.delivery_fee === 0 ? (
                <span className="text-emerald-400 font-bold">FREE</span>
              ) : (
                `₹${order.delivery_fee}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-gray-800">
            <span>Total Paid Amount</span>
            <span className="font-display font-black text-amber-400 text-lg">
              ₹{order.total_amount}
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Direct Order Details */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 space-y-2 text-xs">
        <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
          Direct Order Details:
        </h4>
        <p className="text-gray-200 font-semibold text-sm">{order.customer_name}</p>
        <p className="text-gray-300">Contact Number: <strong className="text-amber-400">{order.customer_phone}</strong></p>
        <p className="text-emerald-400 font-medium">Payment Mode: Pay on Delivery (Cash / Handover)</p>
        {order.customer_notes && (
          <p className="text-gray-400 italic mt-1">Note / City: {order.customer_notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-300 hover:text-white border border-gray-800 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Receipt</span>
        </button>

        <Link
          to="/posters"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-glow-amber transition-all"
        >
          <span>Explore More Posters (₹35)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
