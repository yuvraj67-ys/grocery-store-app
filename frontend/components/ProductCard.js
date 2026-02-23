"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { language } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Auto-select default variant
  const variants = product.variants || [];
  const defaultVariant = variants.find(v => v.isDefault) || variants[0];
  
  const currentVariant = selectedVariant || defaultVariant;
  const currentPrice = currentVariant?.price || product.price;
  const currentStock = currentVariant?.stock || product.stock;
  const currentSize = currentVariant?.size;

  const handleAddToCart = () => {
    if (currentStock < quantity) {
      toast.error(language === 'hi' ? 'स्टॉक खत्म हो गया है' : 'Out of stock');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      nameHi: product.nameHi,
      price: currentPrice,
      image: product.image,
      unit: product.unit,
      stock: currentStock,
      variant: currentSize,
      qty: quantity
    });
  };

  // Badge display logic
  const badges = [];
  if (product.badges?.includes('bestseller')) badges.push({ text: 'Best Seller', color: 'bg-orange-100 text-orange-800' });
  if (product.badges?.includes('new')) badges.push({ text: 'New', color: 'bg-blue-100 text-blue-800' });
  if (product.bulkPricing) badges.push({ text: 'Bulk Offer', color: 'bg-purple-100 text-purple-800' });
  if (currentStock <= 5 && currentStock > 0) badges.push({ text: 'Low Stock', color: 'bg-red-100 text-red-800' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      {/* Product Image */}
      <Link href={`/shop/${product.id}`} className="block relative">
        <div className="relative h-40 w-full bg-gray-100">
          <Image
            src={product.image || 'https://i.ibb.co/0y6mX1D/placeholder.png'}
            alt={language === 'hi' && product.nameHi ? product.nameHi : product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {badges.slice(0, 2).map((badge, i) => (
                <span key={i} className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                  {badge.text}
                </span>
              ))}
            </div>
          )}

          {/* Quick Add Button (mobile) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition md:hidden"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>

        {/* Name */}
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 hover:text-primary transition">
            {language === 'hi' && product.nameHi ? product.nameHi : product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-extrabold text-primary">
            ₹{currentPrice?.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/ {product.unit}</span>
          {currentSize && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {currentSize}
            </span>
          )}
        </div>

        {/* Bulk Pricing Hint */}
        {product.bulkPricing && (
          <p className="text-xs text-purple-600 mb-2">
            🎁 {product.bulkPricing.message || `Buy ${product.bulkPricing.minQty}+ get ${product.bulkPricing.discountPercent}% off`}
          </p>
        )}

        {/* Variant Selector */}
        {variants.length > 1 && (
          <div className="mb-3">
            <div className="flex gap-1 flex-wrap">
              {variants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                  className={`px-2 py-1 text-xs rounded border transition ${
                    currentVariant?.id === variant.id
                      ? 'border-primary bg-green-50 text-primary font-bold'
                      : 'border-gray-200 hover:border-primary'
                  } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={variant.stock <= 0}
                >
                  {variant.size} {variant.stock <= 0 && '❌'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <p className={`text-xs mb-3 ${
          currentStock > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {currentStock > 0 
            ? `✓ In Stock (${currentStock})` 
            : '✗ Out of Stock'}
        </p>

        {/* Quantity + Add to Cart */}
        <div className="flex gap-2">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-gray-100"
            >
              <FiMinus size={14} />
            </button>
            <span className="px-3 font-medium w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              disabled={currentStock <= quantity}
              className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <FiPlus size={14} />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primaryDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiShoppingCart size={18} />
            <span className="hidden sm:inline">
              {language === 'hi' ? 'कार्ट में' : 'Add'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
