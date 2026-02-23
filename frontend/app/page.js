"use client";
import Link from 'next/link';

// Simple banner data (no Swiper needed)
const banners = [
  { id: 1, title: "Fresh Vegetables", bg: "bg-green-100" },
  { id: 2, title: "Daily Essentials", bg: "bg-blue-100" },
  { id: 3, title: "Festival Offers", bg: "bg-orange-100" },
];

// Simple categories
const categories = [
  { id: 1, name: "Vegetables", icon: "🥬" },
  { id: 2, name: "Fruits", icon: "🍎" },
  { id: 3, name: "Dairy", icon: "🥛" },
  { id: 4, name: "Atta & Rice", icon: "🌾" },
  { id: 5, name: "Oil & Spices", icon: "🧂" },
  { id: 6, name: "Snacks", icon: "🍪" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">🛒 FreshCart</h1>
          <p className="text-lg mb-6">Your village kirana store, now online!</p>
          <Link 
            href="/shop" 
            className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Start Shopping →
          </Link>
        </div>
      </div>

      {/* Simple Banner Scroll (no Swiper) */}
      <div className="py-6 px-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {banners.map(banner => (
            <div 
              key={banner.id} 
              className={`flex-shrink-0 w-72 h-32 ${banner.bg} rounded-xl flex items-center justify-center font-bold text-gray-800`}
            >
              {banner.title}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link 
              key={cat.id}
              href={`/shop?category=${cat.name.toLowerCase()}`}
              className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">🚴</div>
            <p className="font-medium">Free Delivery</p>
            <p className="text-sm text-gray-500">Orders above ₹200</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">💵</div>
            <p className="font-medium">Cash on Delivery</p>
            <p className="text-sm text-gray-500">Pay when delivered</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">📞</div>
            <p className="font-medium">Quick Support</p>
            <p className="text-sm text-gray-500">Call us anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
