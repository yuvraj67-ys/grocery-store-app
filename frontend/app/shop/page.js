"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useCart } from '../../context/CartContext';
import Image from 'next/image';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        const productList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productList.filter(p => p.isActive)); // Show only active products
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading products...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="relative h-48 w-full bg-gray-100">
              <Image src={product.image || 'https://i.ibb.co/0y6mX1D/placeholder.png'} alt={product.name} layout="fill" objectFit="cover" />
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-xl font-extrabold text-primary mb-4">${parseFloat(product.price).toFixed(2)} <span className="text-sm font-normal text-gray-500">/ {product.unit}</span></p>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={product.stock < 1}
                className={`w-full py-2 rounded-md font-bold text-white ${product.stock < 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primaryDark'}`}
              >
                {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
