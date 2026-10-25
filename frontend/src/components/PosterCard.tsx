import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Check } from 'lucide-react';
import { Poster } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface PosterCardProps {
  poster: Poster;
  onQuickView?: (poster: Poster) => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({ poster, onQuickView }) => {
  const { addToCart, items } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const cartItem = items.find((i) => i.poster.id === poster.id);
  const isWishlisted = isInWishlist(poster.id);

  return (
    <div className="group relative rounded-2xl bg-dark-850/70 border border-gray-800/80 hover:border-amber-500/50 transition-all duration-300 hover:shadow-poster-hover flex flex-col overflow-hidden">
      {/* Poster Image Container (Strict 2:3 Aspect Ratio) */}
      <div className="relative aspect-[2/3] overflow-hidden bg-dark-900 poster-sheen">
        <Link to={`/poster/${poster.id}`} className="block w-full h-full">
          <img
            src={poster.image_url}
            alt={poster.title || 'Poster'}
            loading="lazy"
            onError={(e) => {
              // Fallback placeholder image if image load fails
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22600%22%20viewBox%3D%220%200%20400%20600%22%20fill%3D%22%2313151b%22%3E%3Crect%20width%3D%22400%22%20height%3D%22600%22%20fill%3D%22%2313151b%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22300%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%3EPoster35%3C%2Ftext%3E%3C%2Fsvg%3E';
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top Floating Badges (Wishlist & Hot indicator, no name overlay) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-end z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {poster.is_trending ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                HOT
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => toggleWishlist(poster)}
              aria-label="Wishlist"
              className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-dark-900/80 text-gray-300 hover:text-white hover:bg-dark-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick View Button (Desktop Hover overlay) */}
        {onQuickView && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
            <button
              type="button"
              onClick={() => onQuickView(poster)}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-900/90 text-white text-xs font-semibold hover:bg-white hover:text-black transition-all shadow-xl hover:scale-105"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Info Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-medium text-gray-300">300 GSM Matte</span>
          <span className="text-gray-600">•</span>
          <span>12×18 in</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-800/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-lg text-amber-400">
                ₹{poster.price || 35}
              </span>
              <span className="text-[10px] text-gray-400 line-through">₹99</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addToCart(poster)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              cartItem
                ? 'bg-dark-800 text-amber-300 border border-amber-500/40 hover:bg-dark-700'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-glow-amber'
            }`}
          >
            {cartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Cart ({cartItem.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
