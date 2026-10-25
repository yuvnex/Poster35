import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          My Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Save your favourite movie and sports posters for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-gray-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-gray-700 flex items-center justify-center text-gray-500 mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your wishlist is empty</h3>
            <p className="text-xs text-gray-400 mt-1">
              Click the heart icon on any poster to save it here for later.
            </p>
          </div>
          <Link
            to="/posters"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-amber transition-all"
          >
            Browse Posters (₹35)
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((poster) => (
            <div
              key={poster.id}
              className="rounded-2xl bg-dark-850 border border-gray-800 p-3 flex flex-col justify-between space-y-3"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-900">
                <img
                  src={poster.image_url}
                  alt={poster.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleWishlist(poster)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-dark-900/80 text-red-400 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white line-clamp-1">{poster.title}</h4>
                <p className="text-[11px] text-gray-400">{poster.category_name}</p>
                <p className="font-display font-black text-amber-400 text-base mt-1">
                  ₹{poster.price || 35}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(poster);
                  toggleWishlist(poster);
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-amber transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
