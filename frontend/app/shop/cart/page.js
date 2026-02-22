"use client";
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { getWhatsAppLink } from '../../../lib/whatsapp';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [address, setAddress] = useState({ landmark: '', timeSlot: 'morning', notes: '' });

  const handleCheckout = async (method) => {
    if (!user) {
      toast.error("कृपया पहले लॉगिन करें (Please login)");
      router.push('/login');
      return;
    }

    try {
      const orderData = {
        userId: user.uid,
        customerEmail: user.email,
        items: cart,
        totalPrice: cartTotal,
        status: 'pending',
        deliveryDetails: address,
        paymentMethod: 'Cash on Delivery',
        createdAt: Date.now()
      };

      await set(push(ref(db, 'orders')), orderData);
      
      if (method === 'whatsapp') {
        const link = getWhatsAppLink(cart, cartTotal, address, address.notes);
        window.open(link, '_blank');
      } else {
        toast.success("ऑर्डर सफल हुआ! (Order Placed Successfully)");
      }
      
      clearCart();
      router.push('/shop');
    } catch (error) {
      toast.error("Error placing order.");
    }
  };

  if (cart.length === 0) return <div className="text-center mt-20 text-2xl font-bold">{t('cart.empty')}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('cart.title')}</h1>
      
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b py-4 last:border-0">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 relative rounded bg-gray-100">
                <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-500">₹{item.price}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-50 rounded-lg border border-green-200">
                <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="px-3 py-1 text-xl font-bold text-green-700">-</button>
                <span className="px-3 font-bold">{item.qty}</span>
                <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-3 py-1 text-xl font-bold text-green-700">+</button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-6 border-t flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <span className="text-xl font-bold">{t('cart.total')}:</span>
          <span className="text-3xl font-extrabold text-green-600">₹{cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Form */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border space-y-4">
        <div>
          <label className="block font-bold mb-2 text-lg">{t('cart.landmark')}</label>
          <input type="text" value={address.landmark} onChange={e=>setAddress({...address, landmark: e.target.value})} className="w-full p-3 border-2 rounded-lg text-lg" placeholder="उदा. शिव मंदिर के पास..." />
        </div>
        
        <div>
          <label className="block font-bold mb-2 text-lg">{t('cart.time_slot')}</label>
          <select value={address.timeSlot} onChange={e=>setAddress({...address, timeSlot: e.target.value})} className="w-full p-3 border-2 rounded-lg text-lg bg-white">
            <option value="morning">{t('cart.morning')}</option>
            <option value="evening">{t('cart.evening')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => handleCheckout('cod')} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-700 shadow-lg active:scale-95 transition">
          {t('cart.proceed_cod')}
        </button>
        <button onClick={() => handleCheckout('whatsapp')} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-xl hover:bg-green-600 shadow-lg flex items-center justify-center gap-2 active:scale-95 transition">
          <FaWhatsapp className="text-2xl" /> {t('cart.order_whatsapp')}
        </button>
      </div>
    </div>
  );
}
