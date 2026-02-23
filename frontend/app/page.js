"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useCart } from '../context/CartContext';
import { FaSearch, FaMicrophone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion'; // 👈 NEW: Pro Animations
import 'swiper/css';
import 'swiper/css/pagination';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      setLoading(false);
    });
    onValue(ref(db, 'categories'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCategories(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
    onValue(ref(db, 'banners'), (snapshot) => {
      const data = snapshot.val();
      if (data) setBanners(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Mobile Top Header (Blinkit Style) */}
      <div className="bg-white p-3 sm:p-4 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary text-xl sm:text-2xl" />
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1">
                Delivery in 10-20 mins <FaClock className="text-yellow-500" />
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate w-48 sm:w-64">Apna Gaon, Kirana Store...</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border text-lg">👤</div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <Link href="/search" className="relative flex-1">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <div className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-500 flex items-center shadow-inner">
              Search 'आटा' or 'दाल'...
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6">
        
        {/* Dynamic Banners with Skeleton */}
        {loading && banners.length === 0 ? (
           <div className="w-full h-40 sm:h-64 bg-gray-200 animate-pulse rounded-xl"></div>
        ) : banners.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden shadow-sm">
            <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 3000 }} pagination={{ clickable: true }} className="w-full h-40 sm:h-64 rounded-xl">
              {banners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  {banner.link ? (
                    <Link href={banner.link} className="block w-full h-full relative"><Image src={banner.image} alt="Banner" layout="fill" objectFit="cover" /></Link>
                  ) : (
                    <div className="w-full h-full relative"><Image src={banner.image} alt="Banner" layout="fill" objectFit="cover" /></div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        ) : null}

        {/* Categories */}
        {categories.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-extrabold text-gray-800 mb-3">दुकान की श्रेणियां</h2>
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
              {categories.map((cat) => (
                <div key={cat.id} className="flex flex-col items-center min-w-[72px] cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 relative mb-1 overflow-hidden hover:shadow-md transition">
                    <Image src={cat.image} alt={cat.name} layout="fill" objectFit="cover" />
                  </div>
                  <p className="text-[10px] text-center font-bold text-gray-700 leading-tight">{cat.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="text-lg font-extrabold text-gray-800 mb-3">आपके लिए खास (Best Sellers)</h2>
          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="bg-white border rounded-xl p-2 h-56 flex flex-col justify-between">
                    <div className="w-full h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4 mt-2"></div>
                    <div className="h-8 bg-gray-100 animate-pulse rounded mt-4"></div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: index * 0.05 }} // Staggered fade in
                  key={product.id} 
                  className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col justify-between"
                >
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative h-28 sm:h-36 w-full bg-white p-2">
                      <Image src={product.image || '/placeholder.svg'} alt={product.name} layout="fill" objectFit="contain" />
                    </div>
                    <div className="px-3 pt-2">
                      <p className="text-[10px] text-gray-500 mb-0.5">{product.unit}</p>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight h-8 overflow-hidden">{product.name}</h3>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-black">₹{product.price}</p>
                      {product.mrp && product.mrp > product.price && <p className="text-[9px] text-gray-400 line-through">₹{product.mrp}</p>}
                    </div>
                    <button 
                      onClick={() => addToCart(product)} disabled={product.stock < 1}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs border shadow-sm active:scale-90 transition-transform ${product.stock < 1 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50 text-primary border-primary hover:bg-primary hover:text-white'}`}
                    >
                      {product.stock < 1 ? 'OUT' : 'ADD'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
