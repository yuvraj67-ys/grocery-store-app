"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaWhatsapp, FaPercent, FaMoneyBillWave, FaMotorcycle } from 'react-icons/fa';
import Image from 'next/image';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Address & Order States
  const [address, setAddress] = useState({ landmark: '', timeSlot: '10-20 mins (Asap)', notes: '' });
  
  // Coupon & Billing States
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Calculate Totals
  const itemTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const mrpTotal = cart.reduce((total, item) => total + ((item.mrp || item.price) * item.qty), 0);
  const itemSavings = mrpTotal - itemTotal;
  
  const deliveryFee = itemTotal >= 199 ? 0 : 40; // Free delivery above ₹199
  const amountToFreeDelivery = 199 - itemTotal;
  
  const grandTotal = itemTotal + deliveryFee - discount;
  const totalSavings = itemSavings + discount + (deliveryFee === 0 && itemTotal > 0 ? 40 : 0);

  // Apply Coupon Logic
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Please enter a coupon code");
    
    // For MVP: Hardcoded village special coupons (You can later move to Firebase)
    if (couponCode.toUpperCase() === 'WELCOME50') {
      if (itemTotal < 200) return toast.error("Minimum order value for this coupon is ₹200");
      setDiscount(50);
      setAppliedCoupon('WELCOME50');
      toast.success("₹50 Discount Applied! 🎉");
    } 
    else if (couponCode.toUpperCase() === 'DIWALI20') {
      const discountAmount = itemTotal * 0.20;
      const finalDiscount = discountAmount > 100 ? 100 : discountAmount; // Max ₹100 off
      setDiscount(finalDiscount);
      setAppliedCoupon('DIWALI20');
      toast.success(`20% Off Applied! You saved ₹${finalDiscount.toFixed(2)} 🎉`);
    }
    else {
      toast.error("Invalid or expired coupon code");
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info("Coupon removed");
  };

  const handleCheckout = async (method) => {
    if (!user) {
      toast.error("Please login to place your order");
      router.push('/login');
      return;
    }

    try {
      const orderData = {
        userId: user.uid,
        customerEmail: user.email,
        items: cart,
        billing: { itemTotal, deliveryFee, discount, grandTotal, totalSavings },
        deliveryDetails: address,
        status: 'pending',
        paymentMethod: 'Cash on Delivery',
        createdAt: Date.now()
      };

      await set(push(ref(db, 'orders')), orderData);
      
      if (method === 'whatsapp') {
        // Simple WhatsApp formatting
        const text = `🛒 *NEW ORDER*\nTotal: ₹${grandTotal}\nPayment: Cash on Delivery\nLandmark: ${address.landmark}\nTime: ${address.timeSlot}`;
        window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
      } else {
        toast.success("Order Placed Successfully! 🚀");
      }
      
      clearCart();
      router.push('/shop');
    } catch (error) {
      toast.error("Failed to place order.");
    }
  };

  if (cart.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6 text-center">Looks like you haven't added anything to your cart yet.</p>
      <button onClick={() => router.push('/shop')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition">
        Browse Products
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 bg-gray-50 min-h-screen pb-32">
      
      {/* Free Delivery Progress Bar */}
      {amountToFreeDelivery > 0 ? (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-blue-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><FaMotorcycle className="text-xl" /></div>
          <div>
            <p className="font-bold text-gray-800">Add ₹{amountToFreeDelivery.toFixed(2)} more</p>
            <p className="text-xs text-gray-500">to get <span className="text-primary font-bold">FREE Delivery</span></p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 shadow-sm mb-4 border border-green-200 flex items-center gap-4">
          <div className="bg-green-200 p-3 rounded-full text-green-700">🎉</div>
          <div>
            <p className="font-bold text-green-800">Yay! Free Delivery unlocked.</p>
            <p className="text-xs text-green-600">You are saving ₹40 on delivery charge.</p>
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border">
        <div className="p-4 bg-gray-50 border-b flex items-center gap-2 font-bold text-gray-700">
          <FaMotorcycle /> Delivery in 10-20 mins
        </div>
        <div className="p-4 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
              <div className="flex gap-3 items-center w-2/3">
                <div className="w-16 h-16 relative rounded-lg border bg-gray-50 overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} layout="fill" objectFit="contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800 leading-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                  <p className="font-extrabold text-sm mt-1">₹{item.price}</p>
                </div>
              </div>
              
              {/* Zepto style +/- button */}
              <div className="flex items-center bg-green-50 rounded-lg border border-green-200 shadow-sm h-9">
                <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="px-3 text-lg font-bold text-green-700 hover:bg-green-100 rounded-l-lg h-full">-</button>
                <span className="px-2 font-bold text-sm text-green-800 w-6 text-center">{item.qty}</span>
                <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-3 text-lg font-bold text-green-700 hover:bg-green-100 rounded-r-lg h-full">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons Section */}
      <div className="bg-white rounded-xl shadow-sm mb-4 border overflow-hidden">
        <div className="p-4 flex items-center gap-2 font-bold text-gray-700 border-b">
          <FaPercent className="text-primary" /> Offers & Benefits
        </div>
        <div className="p-4">
          {appliedCoupon ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-green-800 text-sm">'{appliedCoupon}' applied</p>
                <p className="text-xs text-green-600">₹{discount.toFixed(2)} savings with this coupon</p>
              </div>
              <button onClick={removeCoupon} className="text-red-500 text-sm font-bold">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                placeholder="Enter coupon code" 
                className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase focus:outline-primary"
              />
              <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">
                Apply
              </button>
            </div>
          )}
          <div className="mt-3 text-xs text-gray-500">
             Try <span className="font-bold text-primary cursor-pointer border-b border-dashed border-primary" onClick={()=>setCouponCode('WELCOME50')}>WELCOME50</span> for ₹50 off on orders above ₹200!
          </div>
        </div>
      </div>

      {/* Bill Details */}
      <div className="bg-white rounded-xl shadow-sm mb-4 border overflow-hidden">
        <div className="p-4 flex items-center gap-2 font-bold text-gray-700 border-b">
          <FaMoneyBillWave className="text-primary" /> Bill Details
        </div>
        <div className="p-4 space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Item Total</span>
            <span className="font-medium">₹{itemTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-medium">
              {deliveryFee === 0 ? <span className="text-primary font-bold text-xs bg-green-50 px-2 py-1 rounded">FREE</span> : `₹${deliveryFee}`}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Coupon Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-base">Grand Total</span>
            <span className="font-extrabold text-black text-lg">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        {totalSavings > 0 && (
          <div className="bg-green-50 p-3 text-center text-green-800 text-sm font-bold">
            You are saving ₹{totalSavings.toFixed(2)} on this order!
          </div>
        )}
      </div>

      {/* Delivery Details */}
      <div className="bg-white rounded-xl shadow-sm mb-6 border overflow-hidden p-4">
        <h3 className="font-bold text-gray-700 mb-3">Delivery to</h3>
        <input 
          type="text" 
          placeholder="Landmark (Near mandir, blue gate...)" 
          value={address.landmark}
          onChange={(e) => setAddress({...address, landmark: e.target.value})}
          className="w-full border rounded-lg px-3 py-3 text-sm focus:border-primary focus:outline-none bg-gray-50"
          required
        />
      </div>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex gap-3 z-50 rounded-t-2xl">
        <div className="w-1/3">
          <p className="text-xs text-gray-500 font-bold uppercase">Pay via COD</p>
          <p className="text-xl font-extrabold text-black">₹{grandTotal.toFixed(2)}</p>
        </div>
        <div className="w-2/3 flex gap-2">
          <button onClick={() => handleCheckout('whatsapp')} className="flex-1 bg-[#25D366] text-white rounded-xl flex items-center justify-center text-xl hover:bg-green-600 transition shadow-sm">
            <FaWhatsapp />
          </button>
          <button onClick={() => handleCheckout('cod')} className="flex-3 w-full bg-primary text-white rounded-xl font-bold text-sm sm:text-base hover:bg-green-600 transition shadow-md active:scale-95">
            Place Order
          </button>
        </div>
      </div>

    </div>
  );
}
