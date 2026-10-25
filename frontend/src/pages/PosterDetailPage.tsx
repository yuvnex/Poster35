import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Truck,
  Sparkles,
  ShieldCheck,
  Star,
  Check,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react';
import { Poster } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { PosterCard } from '../components/PosterCard';

export const PosterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [poster, setPoster] = useState<Poster | null>(null);
  const [related, setRelated] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/posters/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPoster(data.poster);
          setRelated(data.related || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!poster) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Poster Not Found</h2>
        <p className="text-gray-400 text-sm">The poster you are looking for does not exist or has been archived.</p>
        <Link
          to="/posters"
          className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm"
        >
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(poster.id);
  const unitPrice = poster.price || 35;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(poster, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(poster, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${poster.title} - Just ₹35 | Poster35`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link to="/" className="hover:text-amber-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/posters" className="hover:text-amber-400 transition-colors">
          All Posters
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/posters?category=${poster.category_slug}`}
          className="hover:text-amber-400 transition-colors"
        >
          {poster.category_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-200 truncate max-w-[200px]">{poster.title}</span>
      </nav>

      {/* Product Details Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: High-Res Poster Image Frame */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[420px] aspect-[2/3] rounded-3xl overflow-hidden shadow-poster-hover border-2 border-gray-800 bg-dark-900 group">
            <img
              src={poster.image_url}
              alt={poster.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-dark-900/80 backdrop-blur-md text-gray-300 hover:text-white transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(poster)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-900/80 text-gray-300 hover:text-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            * Actual print will be high-resolution 300 GSM without any watermarks.
          </p>
        </div>

        {/* Right: Product Info & Pricing Rules */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider">
                {poster.category_name}
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>4.9 / 5.0 (140+ reviews)</span>
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-white leading-tight">
              {poster.title}
            </h1>

            {/* Price Banner */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-display font-black text-4xl text-amber-400">
                ₹{unitPrice}
              </span>
              <span className="text-lg text-gray-500 line-through">₹99</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Fixed ₹35 Storewide
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 mt-4 leading-relaxed">
              {poster.description ||
                `Transform your room with this museum-quality 300 GSM matte poster. High contrast, anti-glare finish, and deep rich blacks.`}
            </p>
          </div>

          {/* Transparent Quantity Pricing Rules Table */}
          <div className="rounded-2xl bg-dark-850 p-4 border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>Automatic Bulk Savings</span>
              <span className="text-amber-400">Fixed ₹35 Formula</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div
                onClick={() => setQuantity(1)}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  quantity === 1
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-dark-900 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="text-[10px] text-gray-400 font-sans">1 Poster</div>
                <div className="font-bold text-sm">₹35</div>
                <div className="text-[9px] text-gray-500 font-sans">+ ₹49 ship</div>
              </div>

              <div
                onClick={() => setQuantity(2)}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  quantity === 2
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-dark-900 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="text-[10px] text-gray-400 font-sans">2 Posters</div>
                <div className="font-bold text-sm">₹70</div>
                <div className="text-[9px] text-gray-500 font-sans">+ ₹49 ship</div>
              </div>

              <div
                onClick={() => setQuantity(3)}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  quantity === 3
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-dark-900 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="text-[10px] text-gray-400 font-sans">3 Posters</div>
                <div className="font-bold text-sm">₹105</div>
                <div className="text-[9px] text-gray-500 font-sans">+ ₹49 ship</div>
              </div>

              <div
                onClick={() => setQuantity(5)}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  quantity === 5
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-dark-900 border-amber-500/40 text-amber-400 hover:border-amber-400'
                }`}
              >
                <div className="text-[10px] text-amber-400 font-sans font-bold">5 Posters</div>
                <div className="font-bold text-sm">₹175</div>
                <div className="text-[9px] text-emerald-400 font-sans font-bold">FREE SHIP</div>
              </div>
            </div>
          </div>

          {/* Specifications Box */}
          <div className="space-y-2.5 text-xs text-gray-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Paper:</strong> 300 GSM Heavyweight Matte Finish (Anti-Glare)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Dimensions:</strong> 12 x 18 inches (30.5 x 45.7 cm) - A3 Size</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Packaging:</strong> Safely rolled in rigid heavy-duty craft tubes</span>
            </div>
          </div>

          {/* Quantity Controls & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-400">Quantity:</span>
                <div className="flex items-center bg-dark-900 rounded-xl border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-gray-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-mono font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    className="px-3.5 py-2 text-gray-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400">Total Price:</span>
                <p className="font-display font-black text-2xl text-white">₹{totalPrice}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-glow-amber active:scale-95 ${
                  added
                    ? 'bg-emerald-500 text-black'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart (₹{totalPrice})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-dark-800 hover:bg-dark-700 text-white border border-gray-700 flex items-center justify-center gap-2 transition-all"
              >
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="rounded-3xl glass-panel border border-gray-800 p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-white">Verified Customer Reviews</h3>
            <p className="text-xs text-gray-400">Real feedback from poster buyers across India</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400 font-display">4.9</span>
            <span className="text-xs text-gray-400"> / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              “Unbelievable quality for just ₹35. The 300 GSM matte paper is truly premium and not thin paper. Arrived safely in a rigid tube.”
            </p>
            <p className="text-[11px] font-semibold text-gray-400">— Ashwin R., Chennai</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              “Ordered 5 posters for ₹175 and got free delivery! The Messi and CR7 posters look epic on my bedroom wall.”
            </p>
            <p className="text-[11px] font-semibold text-gray-400">— Rohan M., Bangalore</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900 border border-gray-800 space-y-2">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              “Colors are so punchy and zero glare when lights are on. Definitely ordering more for my office desk!”
            </p>
            <p className="text-[11px] font-semibold text-gray-400">— Priya K., Mumbai</p>
          </div>
        </div>
      </section>

      {/* Related Posters */}
      {related.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-2xl text-white">
              More from {poster.category_name}
            </h3>
            <Link
              to={`/posters?category=${poster.category_slug}`}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              View Full Category →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map((rel) => (
              <PosterCard key={rel.id} poster={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
