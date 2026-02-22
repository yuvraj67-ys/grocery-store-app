"use client";
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FaBoxOpen, FaClipboardList } from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) return <div className="text-center mt-20 font-bold">Verifying Admin Access...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8 text-primary">Admin Panel</h2>
        <nav className="space-y-4">
          <Link href="/admin/products" className="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
            <FaBoxOpen /> <span>Manage Products</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center space-x-3 p-3 rounded hover:bg-gray-800 transition">
            <FaClipboardList /> <span>Manage Orders</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
