"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaStore } from 'react-icons/fa';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <FaStore className="text-2xl" />
            <span>FreshCart</span>
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link href="/shop" className="hover:text-gray-200 font-medium">Shop</Link>
            
            <Link href="/shop/cart" className="relative flex items-center hover:text-gray-200">
              <FaShoppingCart className="text-xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link href="/admin/products" className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-bold">
                    Admin Panel
                  </Link>
                )}
                <button onClick={logout} className="text-sm hover:underline">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 hover:text-gray-200">
                <FaUser />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
