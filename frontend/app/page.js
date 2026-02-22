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
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      setLoading(false);
    });
  }, []);

  const categories = [
    { name: 'सब्जियां (Veg)', icon: '🥦', id: 'vegetables' },
    { name: 'फल (Fruits)', icon: '🍎', id: 'fruits' },
    { name: 'आटा व दाल (Atta & Dal)', icon: '🌾', id: 'staples' },
    { name: 'दूध व दही (Dairy)', icon: '🥛', id: 'dairy' },
    { name: 'मसाले (Spices)', icon: '🌶️', id: 'spices' },
    { name: 'स्नैक्स (Snacks)', icon: '🍪', id: 'snacks' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Top Blinkit-style Header */}
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
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold border border-yellow-300">
            PRO
          </div>
        </div>

        {/* Sticky Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search 'आटा' or 'दाल'..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
          <button className="bg-green-100 text-green-700 p-3 rounded-xl border border-green-200">
            <FaMicrophone />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        
        {/* Banner Carousel */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            className="w-full h-40 sm:h-64 rounded-xl"
          >
            <SwiperSlide>
              <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-between p-6">
                <div className="text-white">
                  <h2 className="text-2xl font-bold">दीवाली महासेल!</h2>
                  <p className="text-sm mt-1">Get 20% OFF on all Dry Fruits</p>
                </div>
                <div className="text-6xl">🎁</div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-between p-6">
                <div className="text-white">
                  <h2 className="text-2xl font-bold">ताज़ा सब्ज़ियां</h2>
                  <p className="text-sm mt-1">सीधे खेत से आपके घर तक</p>
                </div>
                <div className="text-6xl">🥦</div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Horizontal Categories */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">दुकान की श्रेणियां (Categories)</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[80px] cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-3xl mb-2 hover:bg-green-50 transition">
                  {cat.icon}
                </div>
                <p className="text-xs text-center font-medium text-gray-700">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">आपके लिए खास (Best Sellers)</h2>
          {loading ? (
             <div className="text-center py-10 text-gray-500">Loading products...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                      {product.discount}% OFF
                    </div>
                  )}
                  
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-32 w-full bg-gray-50 p-2">
                      <Image src={product.image || '/placeholder.svg'} alt={product.name} layout="fill" objectFit="contain" />
                    </div>
                  </Link>
                  
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">1 {product.unit}</p>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-sm font-bold text-gray-800 leading-tight mb-2 h-10 overflow-hidden">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-black">₹{product.price}</p>
                        {product.mrp && <p className="text-[10px] text-gray-400 line-through">₹{product.mrp}</p>}
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.stock < 1}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm border ${product.stock < 1 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50 text-green-700 border-green-600 hover:bg-green-600 hover:text-white transition-all'}`}
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
