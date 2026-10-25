import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, Truck, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    subtotal,
    deliveryFee,
    grandTotal,
    totalQuantity,
    updateQuantity,
    removeFromCart,
    isFreeDelivery,
    amountNeededForFreeDelivery,
    freeDeliveryThreshold,
    fulfilmentType,
    setFulfilmentType
  } = useCart();

  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-l border-gray-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-dark-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">Your Cart</h2>
              <span className="px-2 py-0.5 rounded-full bg-dark-800 border border-gray-700 text-xs text-gray-300 font-mono">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Order Header */}
          {items.length > 0 && (
            <div className="p-4 bg-dark-850/80 border-b border-gray-800">
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Direct Order • 100% FREE Delivery!</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">₹0</span>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center text-gray-500 border border-gray-700">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Every poster is fixed at just ₹35. Add 5 or more to get free doorstep shipping!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/posters');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-amber transition-all"
                >
                  Explore Posters (₹35)
                </button>
              </div>
            ) : (
              items.map(({ poster, quantity }) => (
                <div
                  key={poster.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-dark-850 border border-gray-800/80 hover:border-gray-700 transition-colors"
                >
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-14 h-20 object-cover rounded-lg shrink-0 border border-gray-800"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{poster.title}</h4>
                    <p className="text-[11px] text-gray-400">{poster.category_name || 'Poster'}</p>
                    <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                      ₹{poster.price || 35} × {quantity} = ₹{(poster.price || 35) * quantity}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-dark-900 rounded-lg border border-gray-700">
                        <button
                          type="button"
                          onClick={() => updateQuantity(poster.id, quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(poster.id, quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(poster.id)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Order Pricing Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-800 bg-dark-950/80 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>
                    Subtotal ({totalQuantity} posters × ₹35)
                  </span>
                  <span className="font-mono text-white">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                  <span>Grand Total</span>
                  <span className="font-display font-black text-amber-400 text-lg">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black flex items-center justify-center gap-2 shadow-glow-amber transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Proceed to Direct Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-gray-500 text-center">
                Secure checkout with Razorpay • UPI, Cards, Netbanking & COD
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
