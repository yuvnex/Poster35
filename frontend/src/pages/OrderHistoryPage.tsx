import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export const OrderHistoryPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/orders/user/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Track and view all your past poster purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-gray-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-gray-700 flex items-center justify-center text-gray-500 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No orders yet</h3>
            <p className="text-xs text-gray-400 mt-1">
              Browse our posters catalog and grab your favourite art prints for just ₹35 each!
            </p>
          </div>
          <Link
            to="/posters"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-amber transition-all"
          >
            Start Shopping (₹35)
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-dark-900 border border-gray-800 hover:border-gray-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-amber-400">
                    {ord.order_number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ord.payment_status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {ord.payment_status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-dark-800 border border-gray-700 text-[10px] text-gray-300 font-semibold uppercase">
                    {ord.fulfilment_status}
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {ord.item_count || 1} {ord.item_count === 1 ? 'item' : 'items'}
                </p>

                {ord.tracking_number && (
                  <p className="text-xs text-gray-300">
                    Courier: <strong>{ord.courier_name}</strong> • Track: <span className="font-mono text-amber-400">{ord.tracking_number}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray-400 uppercase">Total Amount</span>
                  <p className="font-display font-black text-lg text-white">₹{ord.total_amount}</p>
                </div>

                <Link
                  to={`/order-success/${ord.id}`}
                  className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-200 hover:text-white border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Receipt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
