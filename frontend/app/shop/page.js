"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { startVoiceSearch } from '../../lib/speech';
import { FaMicrophone, FaSearch } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(productList.filter(p => p.isActive));
      }
      setLoading(false);
    });
  }, []);

  const handleVoiceSearch = () => {
    toast.info(t('shop.voice_hint'));
    startVoiceSearch(
      (text) => setSearchTerm(text),
      (error) => toast.error(error)
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-20 text-xl font-bold animate-pulse">Loading... थोड़ा इंतज़ार करें...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search & Voice Bar */}
      <div className="flex mb-8 gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('shop.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl text-lg focus:border-green-600 outline-none"
          />
        </div>
        <button 
          onClick={handleVoiceSearch}
          className="bg-green-100 text-green-700 p-3 rounded-xl border-2 border-green-200 hover:bg-green-200 text-xl"
        >
          <FaMicrophone />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="relative h-36 sm:h-48 w-full bg-gray-50">
              <Image src={product.image || 'https://i.ibb.co/0y6mX1D/placeholder.png'} alt={product.name} layout="fill" objectFit="cover" />
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
              <p className="text-xl sm:text-2xl font-extrabold text-green-600 mb-3">
                ₹{product.price} <span className="text-sm text-gray-500 font-normal">/ {product.unit}</span>
              </p>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={product.stock < 1}
                className={`w-full py-3 rounded-lg font-bold text-white text-lg transition ${product.stock < 1 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-md'}`}
              >
                {product.stock < 1 ? t('shop.out_of_stock') : t('shop.add_to_cart')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
