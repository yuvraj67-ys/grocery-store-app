"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-20 px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Fresh Groceries, <span className="text-primary">Delivered to You.</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Shop farm-fresh vegetables, fruits, and daily essentials with our easy-to-use platform. Same day delivery available!
        </p>
        <div className="flex space-x-4 justify-center">
          <Link href="/shop" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-primaryDark transition">
            Start Shopping
          </Link>
          <Link href="/login" className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-50 transition">
            Register Now
          </Link>
        </div>
      </div>
      
      {/* Banner Image Placeholder */}
      <div className="mt-16 w-full max-w-4xl bg-green-100 rounded-2xl h-64 flex items-center justify-center border-4 border-white shadow-xl">
        <p className="text-green-800 text-2xl font-bold">🛒 🥦 🍎 🥖 FreshCart 🧀 🥩 🥕 🍉</p>
      </div>
    </div>
  );
}
