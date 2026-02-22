"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { FaCheckCircle, FaBoxOpen, FaMotorcycle, FaPhoneAlt } from 'react-icons/fa';
import Countdown from 'react-countdown';
import Image from 'next/image';

export default function OrderTracking({ params }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orderRef = ref(db, `orders/${params.id}`);
    onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) setOrder(snapshot.val());
    });
  }, [params.id]);

  if (!order) return <div className="p-10 text-center font-bold">Loading your order...</div>;

  const deliveryTime = order.createdAt + (45 * 60 * 1000); 

  const renderer = ({ minutes, seconds, completed }) => {
    if (completed || order.status === 'delivered') {
      return <span className="text-green-600 font-extrabold">Delivered!</span>;
    } else {
      return <span>{minutes} mins {seconds} secs</span>;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="w-full h-48 bg-blue-100 flex items-center justify-center relative border-b-4 border-primary">
        <p className="text-blue-500 font-bold">📍 Live Map Tracking (Coming Soon)</p>
        <div className="absolute -bottom-6 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-primary">
          <p className="text-sm text-gray-500 font-bold">Arriving in</p>
          <p className="text-2xl font-extrabold text-primary">
            <Countdown date={deliveryTime} renderer={renderer} />
          </p>
        </div>
      </div>

      <div className="pt-12 px-6 pb-6">
        <h2 className="text-xl font-bold mb-6 text-center">Order Status</h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"><FaCheckCircle /></div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border"><h3 className="font-bold text-gray-800">Order Confirmed</h3><p className="text-xs text-gray-500">We have received your order.</p></div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white text-white shadow shrink-0 md:order-1 ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}><FaBoxOpen /></div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border"><h3 className="font-bold text-gray-800">Packing Order</h3><p className="text-xs text-gray-500">Items are being packed securely.</p></div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white text-white shadow shrink-0 md:order-1 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}><FaMotorcycle /></div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border"><h3 className="font-bold text-gray-800">Out for Delivery</h3><p className="text-xs text-gray-500">Raju Bhaiya is on the way.</p></div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
               <Image src="/placeholder.svg" alt="Boy" layout="fill" objectFit="cover" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Raju Kumar</p>
              <p className="text-xs text-gray-500">Delivery Partner</p>
            </div>
          </div>
          <a href="tel:9876543210" className="bg-green-100 text-green-700 p-3 rounded-full border border-green-200"><FaPhoneAlt /></a>
        </div>
      </div>
    </div>
  );
}
