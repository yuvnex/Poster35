import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  Truck,
  IndianRupee,
  ShoppingBag,
  Search,
  Eye,
  AlertCircle,
  ExternalLink,
  Save,
  RefreshCw,
  Download,
  Maximize2,
  Phone,
  MessageCircle,
  X,
  ZoomIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Poster, Category, Order } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAdmin, login } = useAuth();
  const navigate = useNavigate();

  // Tabs: 'analytics' | 'posters' | 'categories' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState<'analytics' | 'posters' | 'categories' | 'orders' | 'settings'>('analytics');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Poster Form Modal State
  const [isAddPosterOpen, setIsAddPosterOpen] = useState(false);
  const [posterTitle, setPosterTitle] = useState('');
  const [posterCategory, setPosterCategory] = useState('');
  const [posterPrice, setPosterPrice] = useState('35');
  const [posterDescription, setPosterDescription] = useState('');
  const [posterTags, setPosterTags] = useState('');
  const [posterIsFeatured, setPosterIsFeatured] = useState(false);
  const [posterIsTrending, setPosterIsTrending] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState('');

  // Edit Poster State
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);

  // Add Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderTracking, setOrderTracking] = useState('');
  const [orderCourier, setOrderCourier] = useState('DTDC Express');

  // Full-Screen Image Lightbox Modal State
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    url: string;
    title: string;
    price?: number;
    quantity?: number;
  } | null>(null);

  // Admin Login Form state if not logged in (empty for secure hosting)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Open Order Details and ensure full item snapshots are loaded
  const openOrderDetails = async (ord: Order) => {
    setSelectedOrder(ord);
    setOrderTracking(ord.tracking_number || '');
    setOrderCourier(ord.courier_name || 'DTDC Express');

    if (!ord.items || ord.items.length === 0) {
      try {
        const res = await fetch(`/api/admin/orders/${ord.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.order) {
          setSelectedOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load full order items:', err);
      }
    }
  };

  const fetchDashboardData = () => {
    if (!token) return;
    setLoading(true);

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/stats', { headers }).then((r) => r.json()),
      fetch('/api/admin/orders', { headers }).then((r) => r.json()),
      fetch('/api/posters?limit=100').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/admin/settings', { headers }).then((r) => r.json())
    ])
      .then(([statsData, ordersData, postersData, categoriesData, settingsData]) => {
        if (statsData.success) setStats(statsData.stats);
        if (ordersData.success) setOrders(ordersData.orders);
        if (postersData.success) setPosters(postersData.posters);
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
          if (categoriesData.categories.length > 0 && !posterCategory) {
            setPosterCategory(categoriesData.categories[0].id);
          }
        }
        if (settingsData.success) {
          const sMap = settingsData.settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});
          setStoreSettings(sMap);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, token]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await login(adminEmail, adminPassword);
    if (!res.success) {
      setAuthError(res.message || 'Login failed');
    }
  };

  const handleCreatePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterTitle || !posterCategory) return;

    const formData = new FormData();
    formData.append('title', posterTitle);
    formData.append('category_id', posterCategory);
    formData.append('price', posterPrice);
    formData.append('description', posterDescription);
    formData.append('tags', posterTags);
    formData.append('is_featured', posterIsFeatured ? '1' : '0');
    formData.append('is_trending', posterIsTrending ? '1' : '0');

    if (posterFile) {
      formData.append('image', posterFile);
    } else if (posterUrl) {
      formData.append('image_url', posterUrl);
    } else {
      alert('Please select an image file or provide an image URL');
      return;
    }

    try {
      const res = await fetch('/api/admin/posters', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Poster added successfully!');
        setIsAddPosterOpen(false);
        setPosterTitle('');
        setPosterDescription('');
        setPosterFile(null);
        setPosterUrl('');
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to add poster');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading poster');
    }
  };

  const handleDeletePoster = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poster?')) return;
    try {
      const res = await fetch(`/api/admin/posters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Poster deleted');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status?: string, paymentStatus?: string) => {
    try {
      const payload: any = {
        courier_name: orderCourier,
        tracking_number: orderTracking
      };
      if (status) payload.fulfilment_status = status;
      if (paymentStatus) payload.payment_status = paymentStatus;

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Order updated successfully!`);
        setSelectedOrder(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDescription
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Category added successfully!');
        setNewCatName('');
        setNewCatDescription('');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: storeSettings,
          apply_to_all_posters: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Store settings updated and synced!');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // If user is not an administrator, render Admin Login screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="p-8 rounded-3xl glass-panel border border-amber-500/30 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-display font-black text-2xl text-white">
              Administrator Portal
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Restricted to authorized store managers
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 shadow-glow-amber transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          <p className="text-[11px] text-gray-500">
            Authorized administrator access only. All actions are logged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
              AUTHORIZED ADMINISTRATOR
            </span>
            <span className="text-xs text-gray-400">Fixed ₹35 Store Management</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Poster35 Admin Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-300 hover:text-white border border-gray-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsAddPosterOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-glow-amber transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Poster</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview & Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('posters')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'posters'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Posters Inventory ({posters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Store & Pricing Settings</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & OVERVIEW */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Verified Revenue
              </span>
              <p className="font-display font-black text-3xl text-emerald-400">
                ₹{stats.verifiedRevenue}
              </p>
              <p className="text-[11px] text-gray-500">From verified payment orders</p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Total Orders
              </span>
              <p className="font-display font-black text-3xl text-amber-400">
                {stats.totalOrders}
              </p>
              <p className="text-[11px] text-gray-500">Lifetime orders placed</p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Pending Shipments
              </span>
              <p className="font-display font-black text-3xl text-red-400">
                {stats.pendingOrders}
              </p>
              <p className="text-[11px] text-gray-500">Needs packaging & dispatch</p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Active Catalog
              </span>
              <p className="font-display font-black text-3xl text-white">
                {stats.totalPosters}
              </p>
              <p className="text-[11px] text-gray-500">Fixed ₹35 real posters in store</p>
            </div>
          </div>

          {/* Best Sellers & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Best Sellers */}
            <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-gray-800 space-y-4">
              <h3 className="font-display font-bold text-base text-white">
                Top Performing Posters
              </h3>
              <div className="space-y-3">
                {stats.bestSellers?.length > 0 ? (
                  stats.bestSellers.map((b: any) => (
                    <div key={b.poster_id} className="flex items-center gap-3 p-2 rounded-xl bg-dark-950 border border-gray-800/80">
                      <img src={b.image_url} alt={b.title} className="w-10 h-14 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{b.title}</p>
                        <p className="text-[11px] text-gray-400">{b.total_sold} units sold • ₹{b.total_revenue}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">No sales data recorded yet.</p>
                )}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-gray-800 space-y-4">
              <h3 className="font-display font-bold text-base text-white">
                Latest Customer Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="pb-2">Order #</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {stats.recentOrders?.map((ro: any) => (
                      <tr key={ro.id} className="hover:bg-dark-950/40">
                        <td className="py-2.5 font-mono text-amber-400">{ro.order_number}</td>
                        <td className="py-2.5 text-gray-200">{ro.customer_name}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ro.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {ro.payment_status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">₹{ro.total_amount}</td>
                        <td className="py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => openOrderDetails(ro)}
                            className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-amber-400 border border-gray-700 text-[11px] font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl glass-panel border border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Customer Orders Management
              </h3>
              <p className="text-xs text-gray-400">
                View customer selected photos, order status, and dispatch tracking
              </p>
            </div>
            <span className="text-xs text-gray-400">Total: {orders.length} orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer Details</th>
                  <th className="pb-3 min-w-[130px]">Selected Photo(s)</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Fulfilment</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-dark-950/40">
                    <td className="py-3 font-mono font-bold text-amber-400">
                      {ord.order_number}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-white">{ord.customer_name}</p>
                      <p className="text-[11px] text-gray-400">{ord.customer_phone}</p>
                    </td>
                    <td className="py-3">
                      {ord.items && ord.items.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ord.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={item.id || idx}
                              onClick={() => openOrderDetails(ord)}
                              className="relative group cursor-pointer"
                              title={`${item.poster_title_snapshot} (Qty: ${item.quantity})`}
                            >
                              <img
                                src={item.image_url_snapshot}
                                alt={item.poster_title_snapshot}
                                className="w-10 h-14 object-cover rounded-lg border border-gray-700/80 group-hover:border-amber-400 group-hover:scale-105 transition-all shadow-md bg-dark-950 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder-poster.jpg';
                                }}
                              />
                              {item.quantity > 1 && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-black rounded-full px-1 shadow">
                                  {item.quantity}x
                                </span>
                              )}
                            </div>
                          ))}
                          {ord.items.length > 3 && (
                            <button
                              type="button"
                              onClick={() => openOrderDetails(ord)}
                              className="text-[10px] text-amber-400 font-bold bg-dark-800 border border-gray-700 px-1.5 py-1 rounded hover:bg-dark-700"
                            >
                              +{ord.items.length - 3}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-[11px]">No photos</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(ord.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-dark-800 text-[10px] font-semibold text-gray-300">
                        {ord.fulfilment_type}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.payment_status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-dark-800 text-gray-200 border border-gray-700 text-[10px] font-semibold">
                        {ord.fulfilment_status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white">
                      ₹{ord.total_amount}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => openOrderDetails(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POSTERS INVENTORY */}
      {activeTab === 'posters' && (
        <div className="p-6 rounded-3xl glass-panel border border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Posters Inventory (Fixed ₹35 Catalog)
              </h3>
              <p className="text-xs text-gray-400">Add, edit, or archive posters</p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddPosterOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-glow-amber transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Poster</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {posters.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-dark-900 border border-gray-800 p-2.5 flex flex-col justify-between space-y-2 group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-950">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeletePoster(p.id)}
                      className="p-1.5 rounded-full bg-dark-900/90 text-red-400 hover:text-white"
                      title="Delete Poster"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white truncate">{p.title}</h4>
                  <p className="text-[10px] text-gray-400">{p.category_name}</p>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-1">₹{p.price || 35}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-gray-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Add New Category
            </h3>
            <p className="text-xs text-gray-400">
              Create a new category without modifying code
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marvel Universe"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Iron Man, Captain America, Spider-Man art prints"
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-glow-amber"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-gray-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Active Categories ({categories.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-dark-900 border border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                    <p className="text-xs text-gray-400">{cat.poster_count || 0} Posters</p>
                  </div>
                  <Link
                    to={`/posters?category=${cat.slug}`}
                    className="p-2 rounded-xl bg-dark-800 text-amber-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORE & PRICING SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel border border-gray-800 space-y-6">
          <div>
            <h3 className="font-display font-bold text-xl text-white">
              Store & Pricing Settings
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Configure the fixed poster price, delivery thresholds, and store contact info.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">
                Default Poster Price (INR ₹) *
              </label>
              <input
                type="number"
                value={storeSettings.default_poster_price || '35'}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, default_poster_price: e.target.value })
                }
                className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:border-amber-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Updating this will automatically sync and update the default price across all posters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Delivery Fee (INR ₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.delivery_fee || '49'}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, delivery_fee: e.target.value })
                  }
                  className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Free Delivery Threshold (INR ₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.free_delivery_threshold || '175'}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      free_delivery_threshold: e.target.value
                    })
                  }
                  className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">
                Store Phone / WhatsApp
              </label>
              <input
                type="text"
                value={storeSettings.store_phone || '+91 98765 43210'}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, store_phone: e.target.value })
                }
                className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">
                Store Contact Email
              </label>
              <input
                type="email"
                value={storeSettings.store_email || 'orders@poster35.com'}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, store_email: e.target.value })
                }
                className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-glow-amber transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Store Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add New Poster */}
      {isAddPosterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-dark-900 border border-gray-800 p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-white">
              Upload New Poster to Store
            </h3>

            <form onSubmit={handleCreatePoster} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1">Poster Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cristiano Ronaldo - Iconic Siuu"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  className="w-full bg-dark-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1">Category *</label>
                  <select
                    value={posterCategory}
                    onChange={(e) => setPosterCategory(e.target.value)}
                    className="w-full bg-dark-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-400 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={posterPrice}
                    onChange={(e) => setPosterPrice(e.target.value)}
                    className="w-full bg-dark-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1">Poster Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPosterFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-dark-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-400 focus:border-amber-500"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">Or specify image URL below:</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full bg-dark-950 border border-gray-800 rounded-xl px-3 py-1.5 text-white mt-1 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={posterIsFeatured}
                    onChange={(e) => setPosterIsFeatured(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span className="text-gray-300">Featured Poster</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={posterIsTrending}
                    onChange={(e) => setPosterIsTrending(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span className="text-gray-300">Trending / Hot</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddPosterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold shadow-glow-amber"
                >
                  Save Poster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details & Customer Selected Photos */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-dark-900 border border-gray-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-dark-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base sm:text-lg text-white">
                      Order Details & Customer Photos
                    </h3>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      {selectedOrder.order_number}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Customer Information & Direct Actions */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-gray-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Customer Information
                  </span>
                  <p className="text-sm font-bold text-white">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-xs font-mono text-gray-300">
                    Phone: <strong>{selectedOrder.customer_phone}</strong>
                  </p>
                  {selectedOrder.shipping_address && (
                    <p className="text-xs text-gray-400">
                      Address: {selectedOrder.shipping_address}
                      {selectedOrder.city ? `, ${selectedOrder.city}` : ''}
                      {selectedOrder.pincode ? ` - ${selectedOrder.pincode}` : ''}
                    </p>
                  )}
                  {selectedOrder.customer_notes && (
                    <p className="text-xs text-amber-300/80 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      Note: "{selectedOrder.customer_notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>
                    <a
                      href={`https://wa.me/91${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hi ${selectedOrder.customer_name}! Regarding your poster order ${selectedOrder.order_number} at Poster35...`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2 sm:border-l sm:border-gray-800/80 sm:pl-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Order Status & Total
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        selectedOrder.payment_status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      Payment: {selectedOrder.payment_status === 'PAID' ? 'PAID / VERIFIED' : 'PENDING (Direct / COD)'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-dark-800 text-gray-200 border border-gray-700 text-[11px] font-semibold">
                      Fulfilment: {selectedOrder.fulfilment_status}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-gray-400 text-xs">Total Bill Amount:</span>
                    <p className="font-display font-black text-2xl text-amber-400">
                      ₹{selectedOrder.total_amount}
                      <span className="text-xs font-normal text-gray-400 ml-2">
                        (₹35 × {selectedOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1} posters • Free Delivery)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* CUSTOMER SELECTED PHOTOS / ORDER ITEMS */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <span>📸 Customer Selected Photos</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || selectedOrder.items?.length || 0} Posters Ordered
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400">
                    Below are the exact photos selected by the customer. Click on any photo to zoom in high resolution:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3.5 rounded-2xl bg-dark-950 border border-gray-800 hover:border-amber-500/40 transition-all flex gap-3.5 items-center group"
                      >
                        {/* High-Res Photo Thumbnail with Zoom On Hover */}
                        <div
                          onClick={() =>
                            setLightboxPhoto({
                              url: item.image_url_snapshot,
                              title: item.poster_title_snapshot,
                              price: item.unit_price_snapshot,
                              quantity: item.quantity
                            })
                          }
                          className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden border border-amber-500/30 shrink-0 bg-dark-900 shadow-lg cursor-pointer group-hover:border-amber-400 transition-all"
                          title="Click to view full screen"
                        >
                          <img
                            src={item.image_url_snapshot}
                            alt={item.poster_title_snapshot}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder-poster.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn className="w-5 h-5 text-amber-400 drop-shadow" />
                          </div>
                        </div>

                        {/* Poster Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h5 className="font-semibold text-white text-xs leading-snug line-clamp-2">
                            {item.poster_title_snapshot}
                          </h5>
                          <p className="text-[11px] text-gray-400">
                            300 GSM Matte Paper • 12×18 in (A3)
                          </p>

                          <div className="flex items-center gap-2 pt-1 font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-gray-300 font-semibold text-xs">
                              ₹{item.unit_price_snapshot} × {item.quantity} = ₹{item.line_total}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxPhoto({
                                  url: item.image_url_snapshot,
                                  title: item.poster_title_snapshot,
                                  price: item.unit_price_snapshot,
                                  quantity: item.quantity
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Zoom</span>
                            </button>
                            <span className="text-gray-600">•</span>
                            <a
                              href={item.image_url_snapshot}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-white"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open Raw</span>
                            </a>
                            <span className="text-gray-600">•</span>
                            <a
                              href={item.image_url_snapshot}
                              download={`${item.poster_title_snapshot || 'poster'}.jpg`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-white"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 rounded-2xl bg-dark-950 border border-gray-800 text-center text-gray-400">
                      No poster item records found for this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Courier & Tracking Inputs */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-gray-800 space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Fulfilment & Dispatch Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-400 mb-1">Courier Service</label>
                    <input
                      type="text"
                      value={orderCourier}
                      onChange={(e) => setOrderCourier(e.target.value)}
                      placeholder="e.g. DTDC Express / India Post / Local Hand Delivery"
                      className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-400 mb-1">Tracking Number / AWB</label>
                    <input
                      type="text"
                      value={orderTracking}
                      onChange={(e) => setOrderTracking(e.target.value)}
                      placeholder="e.g. DTDC123456789IN"
                      className="w-full bg-dark-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-800/80">
                  <span className="block font-semibold text-gray-400 text-xs">Update Status:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'PROCESSING')}
                      className="py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-amber-300 text-xs font-semibold"
                    >
                      Printing / Packing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'SHIPPED')}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
                    >
                      Mark Shipped
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'DELIVERED', 'PAID')}
                      className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                    >
                      Delivered & Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'CANCELLED')}
                      className="py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/80 bg-dark-950/60 shrink-0">
              <span className="text-xs text-gray-400">
                Fixed Rate ₹35/poster • Free Shipping
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-xs font-bold transition-colors"
              >
                Close View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in">
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <a
              href={lightboxPhoto.url}
              download={`${lightboxPhoto.title || 'poster'}.jpg`}
              className="px-3.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-amber-400 border border-gray-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res</span>
            </a>
            <a
              href={lightboxPhoto.url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white border border-gray-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </a>
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="w-9 h-9 rounded-full bg-dark-800 hover:bg-dark-700 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-2xl w-full flex flex-col items-center space-y-3">
            <div className="relative max-h-[75vh] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-dark-950 flex items-center justify-center">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-display font-bold text-base text-white">
                {lightboxPhoto.title}
              </h4>
              <p className="text-xs text-amber-400 font-mono">
                Customer Selected Photo • Fixed ₹35 Rate {lightboxPhoto.quantity ? `• Quantity: ${lightboxPhoto.quantity}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
