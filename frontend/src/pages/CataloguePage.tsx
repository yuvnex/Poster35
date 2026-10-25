import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Layers, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { Poster, Category } from '../types';
import { PosterCard } from '../components/PosterCard';
import { PosterQuickViewModal } from '../components/PosterQuickViewModal';

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'popular';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [posters, setPosters] = useState<Poster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickViewPoster, setQuickViewPoster] = useState<Poster | null>(null);

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Sync search input when param changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch posters when query params change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    if (currentSort) params.set('sort', currentSort);
    params.set('page', String(currentPage));
    params.set('limit', '20');

    fetch(`/api/posters?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPosters(data.posters);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Banner / Header */}
      <div className="rounded-3xl glass-panel border border-gray-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fixed ₹35 Per Poster Collection</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-white">
            {activeCategoryObj ? activeCategoryObj.name : 'All Posters Catalogue'}
          </h1>

          <p className="text-xs sm:text-sm text-gray-400">
            {activeCategoryObj
              ? activeCategoryObj.description
              : 'Browse our extensive catalog of 200+ high definition posters. 5 posters = ₹175 with free shipping!'}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="space-y-4">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              currentCategory === 'all'
                ? 'bg-amber-500 text-black shadow-glow-amber'
                : 'bg-dark-850 hover:bg-dark-800 text-gray-300 border border-gray-800'
            }`}
          >
            All Posters ({totalCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentCategory === cat.slug
                  ? 'bg-amber-500 text-black shadow-glow-amber'
                  : 'bg-dark-850 hover:bg-dark-800 text-gray-300 border border-gray-800'
              }`}
            >
              {cat.name} {cat.poster_count !== undefined && `(${cat.poster_count})`}
            </button>
          ))}
        </div>

        {/* Search, Sort, and Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-dark-900 border border-gray-800">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by title or hero..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-dark-950 border border-gray-800 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Sort Dropdown & Reset */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {(currentCategory !== 'all' || currentSearch) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">Sort:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-dark-950 border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="popular">Most Popular / Hot</option>
                <option value="newest">Recently Added</option>
                <option value="alpha_asc">Alphabetical (A - Z)</option>
                <option value="alpha_desc">Alphabetical (Z - A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posters Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-dark-900 border border-gray-800 aspect-[2/3] animate-pulse"
            />
          ))}
        </div>
      ) : posters.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-gray-800 space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-gray-700 flex items-center justify-center text-gray-500 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No posters found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              We couldn’t find any posters matching your search criteria. Try browsing another category or resetting filters.
            </p>
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-amber transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {posters.map((poster) => (
            <PosterCard
              key={poster.id}
              poster={poster}
              onQuickView={(p) => setQuickViewPoster(p)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => updateParam('page', String(currentPage - 1))}
            className="p-2 rounded-xl bg-dark-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => updateParam('page', String(pageNum))}
                className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-black shadow-glow-amber'
                    : 'bg-dark-900 border border-gray-800 text-gray-300 hover:bg-dark-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => updateParam('page', String(currentPage + 1))}
            className="p-2 rounded-xl bg-dark-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <PosterQuickViewModal
        poster={quickViewPoster}
        onClose={() => setQuickViewPoster(null)}
      />
    </div>
  );
};
