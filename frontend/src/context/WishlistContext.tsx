import React, { createContext, useContext, useState, useEffect } from 'react';
import { Poster } from '../types';

interface WishlistContextType {
  wishlist: Poster[];
  toggleWishlist: (poster: Poster) => void;
  isInWishlist: (posterId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Poster[]>(() => {
    try {
      const saved = localStorage.getItem('poster35_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('poster35_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (poster: Poster) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === poster.id);
      if (exists) {
        return prev.filter((p) => p.id !== poster.id);
      }
      return [...prev, poster];
    });
  };

  const isInWishlist = (posterId: string) => {
    return wishlist.some((p) => p.id === posterId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
