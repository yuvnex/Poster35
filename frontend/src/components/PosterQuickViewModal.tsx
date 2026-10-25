import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart, Check, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { Poster } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface PosterQuickViewModalProps {
  poster: Poster | null;
  onClose: () => void;
}

export const PosterQuickViewModal: React.FC<PosterQuickViewModalProps> = ({ poster, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [poster]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!poster) return null;

  const isWishlisted = isInWishlist(poster.id);
  const unitPrice = poster.price || 35;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(poster, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-dark-900 border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark-800/80 hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Large Image Preview */}
          <div className="relative bg-dark-950 flex items-center justify-center p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-800">
            <div className="relative w-full max-w-[280px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800/60">
              <img
                src={poster.image_url}
                alt={poster.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details & Ordering */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category Pill */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider">
                  {poster.category_name || 'Poster'}
                </span>
                <span className="text-xs text-gray-400">Fixed ₹35 Catalog</span>
              </div>

              <h3 className="font-display font-bold text-xl md:text-2xl text-white leading-snug">
                {poster.title}
              </h3>

              <div className="flex items-baseline gap-2 mt-3">
                <span className="font-display font-black text-3xl text-amber-400">
                  ₹{unitPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">₹99</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Save 65%
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                {poster.description ||
                  `Premium 300 GSM matte poster. Crisp details, rich color depth, and completely anti-glare.`}
              </p>

              {/* Specs List */}
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>300 GSM Gallery Grade Art Matte Paper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Delivered safely in rigid heavy-duty craft tubes</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Replacement Guarantee if damaged</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-400">Quantity:</span>
                  <div className="flex items-center bg-dark-800 rounded-xl border border-gray-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-mono font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                      className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400">Total:</span>
                  <p className="font-mono font-bold text-lg text-white">₹{totalPrice}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-glow-amber active:scale-95 ${
                    added
                      ? 'bg-emerald-500 text-black'
                      : 'bg-amber-500 hover:bg-amber-400 text-black'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart (₹{totalPrice})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(poster)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isWishlisted
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-dark-800 border-gray-700 text-gray-300 hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-400' : ''}`} />
                </button>
              </div>

              <div className="text-center">
                <Link
                  to={`/poster/${poster.id}`}
                  onClick={onClose}
                  className="text-xs text-gray-400 hover:text-amber-400 underline underline-offset-4"
                >
                  View full poster details and customer reviews →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
