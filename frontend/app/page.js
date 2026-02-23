"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useCart } from '../context/CartContext';
import { FaSearch, FaMicrophone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

// Swiper Carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch Products
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      setLoading(false);
    });

    // Fetch Categories
    onValue(ref(db, 'categories'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCategories(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });

    // Fetch Banners
    onValue(ref(db, 'banners'), (snapshot) => {
      const data = snapshot.val();
      if (data) setBanners(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Top Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary text-xl" />
            <div>
              <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                Delivery in 10-20 mins <FaClock className="text-yellow-500" />
              </p>
              <p className="text-sm text-gray-500 truncate w-48">Apna Gaon, Kirana Store ke pass...</p>
            </div>
          </div>
        </div>

        {/* Search Bar linked to /search */}
        <div className="flex gap-2">
          <Link href="/search" className="relative flex-1">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <div className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 flex items-center">
              Search 'आटा' or 'दाल'...
            </div>
          </Link>
          <Link href="/search" className="bg-green-100 text-green-700 p-3 rounded-xl border border-green-200 flex items-center justify-center">
            <FaMicrophone />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        
        {/* Dynamic Banner Carousel */}
        {banners.length > 0 && (
          <div className="rounded-xl overflow-hidden shadow-sm">
            <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 3000 }} pagination={{ clickable: true }} className="w-full h-40 sm:h-64 rounded-xl">
              {banners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  {banner.link ? (
                    <Link href={banner.link} className="block w-full h-full relative">
                      <Image src={banner.image} alt={banner.title} layout="fill" objectFit="cover" />
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                      <Image src={banner.image} alt={banner.title} layout="fill" objectFit="cover" />
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Dynamic Horizontal Categories */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">दुकान की श्रेणियां</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
              {categories.map((cat) => (
                <div key={cat.id} className="flex flex-col items-center min-w-[72px] sm:min-w-[80px]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border border-gray-100 relative mb-2 overflow-hidden hover:shadow-md transition">
                    <Image src={cat.image} alt={cat.name} layout="fill" objectFit="cover" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-center font-bold text-gray-700 leading-tight">{cat.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">आपके लिए खास (Best Sellers)</h2>
          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {[1,2,3,4].map(i => <div key={i} className="bg-gray-200 h-48 rounded-xl animate-pulse"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-28 sm:h-36 w-full bg-white p-2 border-b">
                      <Image src={product.image || '/placeholder.svg'} alt={product.name} layout="fill" objectFit="contain" />
                    </div>
                  </Link>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{product.unit}</p>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight mb-2 h-8 overflow-hidden">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm font-extrabold text-black">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-[10px] text-gray-400 line-through">₹{product.mrp}</p>}
                      </div>
                      <button 
                        onClick={() => addToCart(product)} disabled={product.stock < 1}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border shadow-sm active:scale-95 transition-all ${product.stock < 1 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50 text-green-700 border-green-600 hover:bg-green-600 hover:text-white'}`}
                      >
                        {product.stock < 1 ? 'OUT' : 'ADD'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
