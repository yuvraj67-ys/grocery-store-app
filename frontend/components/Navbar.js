"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { FaShoppingCart, FaUser, FaStore, FaLanguage } from 'react-icons/fa';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { lang, toggleLanguage, t } = useLanguage();
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-green-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <FaStore className="text-2xl" />
            <span>{t('common.app_name')}</span>
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <button onClick={toggleLanguage} className="flex items-center space-x-1 bg-green-700 px-2 py-1 rounded text-sm font-bold">
              <FaLanguage className="text-lg" />
              <span>{lang === 'hi' ? 'EN' : 'HI'}</span>
            </button>

            <Link href="/shop" className="hover:text-gray-200 font-medium hidden sm:block">
              {t('common.shop')}
            </Link>
            
            <Link href="/shop/cart" className="relative flex items-center hover:text-gray-200">
              <FaShoppingCart className="text-2xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {isAdmin && (
                  <Link href="/admin/dashboard" className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="text-sm hover:underline hidden sm:block">{t('common.logout')}</button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 hover:text-gray-200 text-sm">
                <FaUser />
                <span className="hidden sm:block">{t('common.login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
