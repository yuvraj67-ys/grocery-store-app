"use client";
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FaBoxOpen, FaClipboardList, FaChartBar, FaImages, FaTags } from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) return <div className="text-center mt-20 font-bold animate-pulse">Verifying Admin Access...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white p-6 shadow-xl z-20">
        <h2 className="text-2xl font-extrabold mb-8 text-primary flex items-center gap-2">
          <span>FreshCart Admin</span>
        </h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition text-sm font-bold">
            <FaChartBar className="text-lg text-blue-400" /> Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition text-sm font-bold">
            <FaClipboardList className="text-lg text-yellow-400" /> Orders
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition text-sm font-bold">
            <FaBoxOpen className="text-lg text-green-400" /> Products
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition text-sm font-bold">
            <FaTags className="text-lg text-purple-400" /> Categories
          </Link>
          <Link href="/admin/banners" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition text-sm font-bold">
            <FaImages className="text-lg text-pink-400" /> Banners
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
