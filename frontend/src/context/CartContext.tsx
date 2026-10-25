import React, { createContext, useContext, useState, useEffect } from 'react';
import { Poster, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  isFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
  freeDeliveryThreshold: number;
  isCartOpen: boolean;
  fulfilmentType: 'PHYSICAL' | 'DIGITAL';
  setFulfilmentType: (type: 'PHYSICAL' | 'DIGITAL') => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (poster: Poster, quantity?: number) => void;
  removeFromCart: (posterId: string) => void;
  updateQuantity: (posterId: string, quantity: number) => void;
  clearCart: () => void;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('poster35_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfilmentType, setFulfilmentType] = useState<'PHYSICAL' | 'DIGITAL'>('PHYSICAL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const freeDeliveryThreshold = 0; // Free delivery on all orders!
  const standardDeliveryFee = 0;

  useEffect(() => {
    try {
      localStorage.setItem('poster35_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const addToCart = (poster: Poster, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.poster.id === poster.id);
      if (existing) {
        const newQty = Math.min(50, existing.quantity + quantity);
        showToast(`Updated "${poster.title}" quantity to ${newQty}`);
        return prev.map((item) =>
          item.poster.id === poster.id ? { ...item, quantity: newQty } : item
        );
      }
      showToast(`Added "${poster.title}" to cart`);
      return [...prev, { poster, quantity: Math.min(50, quantity) }];
    });
  };

  const removeFromCart = (posterId: string) => {
    setItems((prev) => prev.filter((item) => item.poster.id !== posterId));
  };

  const updateQuantity = (posterId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(posterId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.poster.id === posterId ? { ...item, quantity: Math.min(50, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  // Formula: Subtotal = Total poster quantity × ₹35 (or active price)
  const subtotal = items.reduce((sum, item) => sum + item.quantity * (item.poster.price || 35), 0);

  const isFreeDelivery = true;
  const deliveryFee = 0;
  const grandTotal = subtotal;
  const amountNeededForFreeDelivery = 0;

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        subtotal,
        deliveryFee,
        grandTotal,
        isFreeDelivery,
        amountNeededForFreeDelivery,
        freeDeliveryThreshold,
        isCartOpen,
        fulfilmentType,
        setFulfilmentType,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toastMessage
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
