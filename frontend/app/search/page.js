"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useCart } from '../../context/CartContext';
import { FaSearch, FaMicrophone, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const categories = ['All', 'vegetables', 'fruits', 'staples', 'dairy', 'spices', 'snacks'];

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

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVoiceSearch = () => {
    toast.info("🎤 Listening... (Speak now)");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi Support
      recognition.onresult = (event) => setSearchTerm(event.results[0][0].transcript);
      recognition.start();
    } else {
      toast.error("Voice search not supported in this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm pt-4 px-4 pb-3">
        <div className="flex gap-3 items-center mb-4">
          <Link href="/"><FaArrowLeft className="text-gray-600 text-xl" /></Link>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              autoFocus
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search atta, dal, soap..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
          <button onClick={handleVoiceSearch} className="bg-green-50 text-primary p-3 rounded-xl border border-green-200">
            <FaMicrophone />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-1">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border transition-all ${activeCategory === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {loading ? (
          <div className="text-center mt-10 text-gray-400 animate-pulse font-bold">Searching catalogue...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center mt-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-800">No products found</h3>
            <p className="text-gray-500 text-sm">Try searching for something else like "Atta" or "Milk"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative pb-2">
                <Link href={`/product/${product.id}`}>
                  <div className="relative h-32 w-full bg-gray-50 p-2">
                    {/* Fixed Image Fallback to prevent 404s */}
                    {product.image ? (
                       <Image src={product.image} alt={product.name} layout="fill" objectFit="contain" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">{product.unit}</p>
                  <h3 className="text-sm font-bold text-gray-800 leading-tight mb-2 h-10 overflow-hidden">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-black">₹{product.price}</p>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock < 1}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${product.stock < 1 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50 text-primary border-primary hover:bg-primary hover:text-white transition-all'}`}
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
  );
}
