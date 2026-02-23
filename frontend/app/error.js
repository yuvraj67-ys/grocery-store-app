"use client";
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to console (or error tracking service)
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-gray-600 mb-6">
        Please try again or go back to the shop.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primaryDark"
        >
          🔄 Try Again
        </button>
        <a
          href="/shop"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300"
        >
          ← Back to Shop
        </a>
      </div>
    </div>
  );
}
