import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, Mail, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  
  // Customer Direct Login State (No password required!)
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('poster35_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Admin Login State (Empty defaults for secure hosting)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, directLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from || '/';

  // Handle Customer Direct Login
  const handleCustomerDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name to continue');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await directLogin(customerName.trim(), customerPhone.trim(), customerEmail.trim());
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.message || 'Direct login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login Form Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setError('Please enter both admin email and password');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await login(adminEmail.trim(), adminPassword);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.message || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Admin login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="rounded-3xl glass-panel border border-gray-800 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xl mx-auto shadow-glow-amber">
            ₹35
          </div>
          <h2 className="font-display font-black text-2xl text-white">
            {activeTab === 'customer' ? 'Customer Direct Login' : 'Admin Portal Access'}
          </h2>
          <p className="text-xs text-gray-400">
            {activeTab === 'customer'
              ? 'No sign-up or password needed — enter your name and start ordering!'
              : 'Enter admin credentials to manage posters, orders, and pricing'}
          </p>
        </div>

        {/* Tab Switcher: Direct Customer vs Admin */}
        <div className="grid grid-cols-2 p-1 bg-dark-900 rounded-xl border border-gray-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setError(null);
            }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'customer'
                ? 'bg-amber-500 text-black shadow-md font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Customer (No Sign Up)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-black shadow-md font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. CUSTOMER DIRECT LOGIN (NO SIGN UP / NO PASSWORD) */}
        {activeTab === 'customer' && (
          <div className="space-y-4">
            <form onSubmit={handleCustomerDirectLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Customer Full Name <span className="text-amber-400">* (Required)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Karthik"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">This name will appear on all your orders and delivery invoices</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Phone Number <span className="text-gray-500">(Optional - for delivery SMS)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. +91 98401 23456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Email Address <span className="text-gray-500">(Optional - for order invoice)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. vikram@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 shadow-glow-amber transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Logging In...' : 'Direct Login & Start Shopping'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 2. ADMIN LOGIN PORTAL */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            {/* Secure Admin Note */}
            <div className="p-3.5 rounded-2xl bg-dark-900 border border-gray-800 text-xs text-gray-400 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Enter your authorized administrator credentials to manage the store catalog and customer orders.</span>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Admin Email / ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 shadow-glow-amber transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Admin...' : 'Sign In to Admin Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2">
          <Link
            to="/posters"
            className="text-xs text-gray-400 hover:text-amber-400 transition-colors"
          >
            ← Continue browsing posters directly
          </Link>
        </div>
      </div>
    </div>
  );
};
