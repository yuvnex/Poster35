import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/posters?category=${category.slug}`}
      className="group relative rounded-2xl overflow-hidden bg-dark-900 border border-gray-800/80 hover:border-amber-500/50 transition-all duration-300 hover:shadow-poster-hover flex flex-col justify-end min-h-[220px] p-5 poster-sheen"
    >
      {/* Background Image / Thumbnail with dark gradient overlay */}
      {category.image_url ? (
        <img
          src={category.image_url}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-950" />
      )}

      {/* Dark gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent" />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-dark-900/90 border border-white/10 text-[10px] font-bold text-amber-400 font-mono">
            ₹35 FLAT
          </span>
          {category.poster_count !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
              {category.poster_count} Posters
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
            <span>{category.name}</span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-gray-400 line-clamp-1 mt-1">
            {category.description || 'Premium high-definition poster collection.'}
          </p>
        </div>
      </div>
    </Link>
  );
};
