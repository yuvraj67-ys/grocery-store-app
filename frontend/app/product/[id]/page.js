"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, get } from 'firebase/database';
import { useCart } from '../../../context/CartContext';
import { FaArrowLeft, FaHeart, FaShareAlt, FaStar } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const snapshot = await get(ref(db, `products/${params.id}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Fallback variants if admin hasn't added them yet
        const variants = data.variants || [{ size: `1 ${data.unit}`, price: data.price, mrp: data.price + 10 }];
        setProduct({ id: params.id, ...data, variants });
      }
    };
    fetchProduct();
  }, [params.id]);

  if (!product) return <div className="p-10 text-center animate-pulse">Loading Product...</div>;

  const currentVariant = product.variants[selectedVariant];

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Navbar */}
      <div className="bg-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <Link href="/"><FaArrowLeft className="text-xl text-gray-700" /></Link>
        <div className="flex gap-4">
          <FaShareAlt className="text-xl text-gray-700" />
          <FaHeart className="text-xl text-gray-400" />
        </div>
      </div>

      {/* Image Gallery (Simplified for quick load) */}
      <div className="bg-white w-full h-72 relative border-b">
        <Image src={product.image || '/placeholder.svg'} layout="fill" objectFit="contain" alt={product.name} />
      </div>

      <div className="bg-white p-4 mb-2 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 leading-tight mb-2">{product.name}</h1>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            4.5 <FaStar className="text-[10px]" />
          </div>
          <span className="text-xs text-gray-500">124 Reviews</span>
        </div>

        {/* Variants Selector */}
        <h3 className="font-bold text-sm text-gray-700 mb-2">Select Quantity (मात्रा चुनें)</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar mb-4">
          {product.variants.map((v, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedVariant(idx)}
              className={`flex-shrink-0 p-3 rounded-xl border-2 text-left min-w-[100px] transition-all ${selectedVariant === idx ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <p className="text-sm font-bold">{v.size}</p>
              <p className="text-lg font-extrabold">₹{v.price}</p>
              {v.mrp && <p className="text-xs text-gray-400 line-through">₹{v.mrp}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-2">Product Details (विवरण)</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{product.description || "Fresh and high quality product sourced locally for your daily needs."}</p>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-3 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-between items-center z-50">
        <div>
          <p className="text-xs text-gray-500 line-through">₹{currentVariant.mrp}</p>
          <p className="text-2xl font-extrabold text-gray-900">₹{currentVariant.price}</p>
        </div>
        <button 
          onClick={() => addToCart({ ...product, price: currentVariant.price, unit: currentVariant.size })}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-green-600 active:scale-95 transition-all"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
