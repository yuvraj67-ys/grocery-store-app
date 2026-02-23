"use client";
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link 
        href="/shop" 
        className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primaryDark"
      >
        ← Back to Shop
      </Link>
    </div>
  );
}
