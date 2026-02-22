"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('grocery_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('grocery_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        toast.info(`Increased ${product.name} quantity`);
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      toast.success(`${product.name} added to cart!`);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.error("Item removed from cart");
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
