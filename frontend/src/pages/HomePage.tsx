import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  TrendingUp,
  Clock,
  Layers,
  Star,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { Poster, Category } from '../types';
import { PosterCard } from '../components/PosterCard';
import { CategoryCard } from '../components/CategoryCard';
import { PosterQuickViewModal } from '../components/PosterQuickViewModal';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingPosters, setTrendingPosters] = useState<Poster[]>([]);
  const [recentPosters, setRecentPosters] = useState<Poster[]>([]);
  const [heroPosters, setHeroPosters] = useState<Poster[]>([]);
  const [quickViewPoster, setQuickViewPoster] = useState<Poster | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch(() => {});

    // Fetch trending posters
    fetch('/api/posters?trending=1&limit=8')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTrendingPosters(data.posters);
          if (data.posters.length >= 3) {
            setHeroPosters(data.posters.slice(0, 4));
          }
        }
      })
      .catch(() => {});

    // Fetch newest posters
    fetch('/api/posters?sort=newest&limit=8')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecentPosters(data.posters);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-gray-800/60">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-850 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>FLAT ₹35 PER POSTER • ALL 9 CATEGORIES IN STOCK</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1]">
                Your Favourite Posters.{' '}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Just ₹35.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Movies, football legends, cricket icons, anime, and music. Premium 300 GSM matte art prints delivered safely to your doorstep.
              </p>

              {/* Price Calculation Ribbon */}
              <div className="p-3.5 rounded-2xl bg-dark-850/90 border border-gray-800 inline-flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono">
                <div className="text-gray-300">
                  <span className="text-gray-400">1 Poster = </span>
                  <strong className="text-white">₹35</strong>
                </div>
                <div className="text-gray-300">
                  <span className="text-gray-400">3 Posters = </span>
                  <strong className="text-white">₹105</strong>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                  FREE DELIVERY ON ALL ORDERS (₹0)
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/posters"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-sm tracking-wide shadow-glow-amber flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Explore Posters (₹35)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#categories"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-200 border border-gray-700/80 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:text-white"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Browse Categories</span>
                </a>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>300 GSM Matte Paper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Rigid Tube Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Damage Free Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Cinematic Poster Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[360px] sm:max-w-[420px] aspect-[4/5] flex items-center justify-center">
                {heroPosters.length > 0 ? (
                  <>
                    {/* Layered posters creating 3D depth */}
                    {heroPosters[2] && (
                      <div className="absolute w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl -left-6 top-6 -rotate-12 opacity-60 border border-gray-800/80 hover:opacity-100 transition-opacity">
                        <img
                          src={heroPosters[2].image_url}
                          alt={heroPosters[2].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {heroPosters[1] && (
                      <div className="absolute w-[210px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl -right-6 top-10 rotate-12 opacity-70 border border-gray-800/80 hover:opacity-100 transition-opacity">
                        <img
                          src={heroPosters[1].image_url}
                          alt={heroPosters[1].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Main Featured Center Poster */}
                    <div className="relative z-20 w-[240px] aspect-[2/3] rounded-2xl overflow-hidden shadow-poster-hover border-2 border-amber-500/60 transform hover:scale-105 transition-transform duration-300">
                      <img
                        src={heroPosters[0].image_url}
                        alt={heroPosters[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                        <p className="text-[11px] font-bold text-amber-400 truncate">
                          {heroPosters[0].title}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-300 mt-0.5">
                          <span>{heroPosters[0].category_name}</span>
                          <span className="font-mono font-bold text-white">₹35</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-[240px] aspect-[2/3] rounded-2xl bg-dark-850 border border-gray-800 animate-pulse flex items-center justify-center text-gray-500">
                    Poster35
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Explore The 9 Collections</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Shop by Category
            </h2>
          </div>

          <Link
            to="/posters"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Posters ({trendingPosters.length + recentPosters.length}+)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. TRENDING POSTERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Hot Picks This Week</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Trending Posters — ₹35 Each
            </h2>
          </div>

          <Link
            to="/posters?sort=popular"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>See More Trending</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingPosters.map((poster) => (
            <PosterCard
              key={poster.id}
              poster={poster}
              onQuickView={(p) => setQuickViewPoster(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION: WHY SHOP WITH US? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel border border-gray-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              The Poster35 Difference
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
              Why Are We India’s Favourite Poster Store?
            </h2>
            <p className="text-sm text-gray-400">
              We eliminated expensive branding markups and studio middle-men to give you luxury art gallery prints at wholesale prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-dark-900/60 border border-gray-800/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-lg">
                ₹35
              </div>
              <h3 className="text-base font-bold text-white">No Hidden Fees. Fixed ₹35.</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Whether it is Cristiano Ronaldo, MS Dhoni, Leo, Interstellar, or Pink Floyd, every poster is ₹35. Transparent quantity multipliers: 3 for ₹105, 5 for ₹175.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900/60 border border-gray-800/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">100% Free Shipping on All Orders</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enjoy zero delivery fees anywhere across India on every single order. Track your shipment easily with live tracking updates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900/60 border border-gray-800/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Rigid Cardboard Tubes</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Say goodbye to rolled posters crushed in transit. We pack every single order in thick heavy-duty craft mailing tubes with plastic end caps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENTLY ADDED POSTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Fresh Off The Press</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Recently Added Posters
            </h2>
          </div>

          <Link
            to="/posters?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Explore All New Posters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentPosters.map((poster) => (
            <PosterCard
              key={poster.id}
              poster={poster}
              onQuickView={(p) => setQuickViewPoster(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <PosterQuickViewModal
        poster={quickViewPoster}
        onClose={() => setQuickViewPoster(null)}
      />
    </div>
  );
};
