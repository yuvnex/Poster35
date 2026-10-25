import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  LogOut,
  Package
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Category } from '../types';

export const Navbar: React.FC = () => {
  const { totalQuantity, openCart, subtotal } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/posters?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black py-1.5 px-4 text-center text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>FLAT ₹35 PER POSTER! • 100% FREE DELIVERY ON ALL ORDERS • NO DELIVERY FEE</span>
        <Sparkles className="w-4 h-4 animate-pulse hidden sm:inline" />
      </div>

      {/* Main Glass Navigation Bar */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xl shadow-glow-amber group-hover:scale-105 transition-transform">
                ₹35
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl md:text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  POSTER<span className="text-amber-400">35</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase font-medium -mt-1">
                  Premium Posters
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-amber-400 ${
                  location.pathname === '/' ? 'text-amber-400 font-semibold' : 'text-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/posters"
                className={`text-sm font-medium transition-colors hover:text-amber-400 ${
                  location.pathname === '/posters' && !location.search.includes('category=')
                    ? 'text-amber-400 font-semibold'
                    : 'text-gray-300'
                }`}
              >
                All Posters
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={catRef}>
                <button
                  type="button"
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors focus:outline-none"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isCatDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-72 rounded-2xl glass-panel shadow-2xl p-2 z-50 border border-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-gray-800/60 mb-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Explore by Category
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/posters?category=${cat.slug}`}
                          onClick={() => setIsCatDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-200 hover:bg-dark-800 hover:text-amber-400 transition-colors group"
                        >
                          <span className="font-medium">{cat.name}</span>
                          {cat.poster_count !== undefined && (
                            <span className="text-xs bg-dark-700 group-hover:bg-amber-500/20 text-gray-400 group-hover:text-amber-300 px-2 py-0.5 rounded-full font-mono">
                              {cat.poster_count}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Rule Highlight */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-800 border border-amber-500/20 text-xs font-medium text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>₹35 Each • Free Delivery</span>
              </div>
            </nav>

            {/* Right Action Icons: Search, Wishlist, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Toggle / Input */}
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search 200+ posters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 bg-dark-850 border border-gray-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:w-72 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              {/* Mobile Search Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-dark-800 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-800 transition-colors focus:outline-none"
                  aria-label="Account"
                >
                  <UserIcon className="w-5 h-5" />
                  {user && (
                    <span className="hidden xl:inline text-xs font-medium text-gray-300 max-w-[100px] truncate">
                      {user.full_name}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel shadow-2xl p-2 z-50 border border-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    {user ? (
                      <>
                        <div className="px-3 py-2 border-b border-gray-800 mb-1">
                          <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full">
                              ADMIN ACCESS
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:bg-dark-800 rounded-xl transition-colors font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <Link
                          to="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-dark-800 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-2 border-b border-gray-800 mb-2">
                          <p className="text-xs text-gray-400 font-medium">Welcome to Poster35</p>
                        </div>
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full py-2 px-3 text-center text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-colors mb-1.5"
                        >
                          Direct Login (No Sign Up)
                        </Link>
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-center text-xs text-gray-400 hover:text-amber-300 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Drawer Trigger Button */}
              <button
                type="button"
                onClick={openCart}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-2 rounded-xl font-bold text-sm shadow-glow-amber transition-all hover:scale-105 active:scale-95"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-black" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-amber-400 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-amber-400">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-mono">₹{subtotal}</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-800 transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Input when toggled */}
          {isSearchOpen && (
            <div className="md:hidden pb-3 pt-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search 200+ posters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-dark-850 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-panel border-t border-gray-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-200 hover:bg-dark-800 hover:text-amber-400 rounded-xl"
            >
              Home
            </Link>
            <Link
              to="/posters"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-200 hover:bg-dark-800 hover:text-amber-400 rounded-xl"
            >
              All Posters (200+)
            </Link>

            <div className="pt-2 border-t border-gray-800">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/posters?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-medium text-gray-300 hover:bg-dark-800 hover:text-amber-400 rounded-lg"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2 border-t border-gray-800">
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
