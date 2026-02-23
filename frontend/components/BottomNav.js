"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 px-2 z-50 sm:hidden pb-safe">
      <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-primary' : 'text-gray-400'}`}>
        <FaHome className="text-xl" />
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      
      <Link href="/search" className={`flex flex-col items-center gap-1 ${pathname === '/search' ? 'text-primary' : 'text-gray-400'}`}>
        <FaSearch className="text-xl" />
        <span className="text-[10px] font-bold">Search</span>
      </Link>
      
      <Link href="/shop/cart" className={`flex flex-col items-center gap-1 relative ${pathname === '/shop/cart' ? 'text-primary' : 'text-gray-400'}`}>
        <div className="relative">
          <FaShoppingCart className="text-xl" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
              {cartItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Cart</span>
      </Link>
      
      <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-primary' : 'text-gray-400'}`}>
        <FaUser className="text-xl" />
        <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </div>
  );
}
