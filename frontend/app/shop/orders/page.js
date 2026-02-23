"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiPhone, FiMessageCircle } from 'react-icons/fi';

// Order status configuration with icons and colors
const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    labelHi: 'ऑर्डर मिला', 
    icon: FiClock, 
    color: 'yellow',
    next: 'processing'
  },
  processing: { 
    label: 'Preparing', 
    labelHi: 'तैयार हो रहा है', 
    icon: FiPackage, 
    color: 'blue',
    next: 'out_for_delivery'
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    labelHi: 'डिलीवरी के लिए निकला', 
    icon: FiTruck, 
    color: 'purple',
    next: 'delivered'
  },
  delivered: { 
    label: 'Delivered', 
    labelHi: 'डिलीवर हो गया', 
    icon: FiCheckCircle, 
    color: 'green',
    next: null
  },
  cancelled: { 
    label: 'Cancelled', 
    labelHi: 'रद्द किया गया', 
    icon: FiClock, 
    color: 'red',
    next: null
  }
};

export default function Orders() {
  const { user, language } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/shop/orders');
    }
  }, [user, router]);

  // Fetch user orders
  useEffect(() => {
    if (!user) return;
    
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter and sort user orders
        const userOrders = Object.values(data)
          .filter(order => order.userId === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt);
        setOrders(userOrders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    }, {
      onlyOnce: false // Real-time updates
    });

    return () => unsubscribe();
  }, [user]);

  // Visual timeline component
  const OrderTimeline = ({ status }) => {
    const statuses = ['pending', 'processing', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    const isCancelled = status === 'cancelled';

    return (
      <div className="flex items-center justify-between mb-4">
        {statuses.map((s, index) => {
          const config = STATUS_CONFIG[s];
          const Icon = config.icon;
          const isActive = index <= currentIndex && !isCancelled;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isCancelled 
                  ? 'border-red-300 bg-red-50 text-red-500'
                  : isActive 
                    ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-600` 
                    : 'border-gray-200 bg-gray-50 text-gray-400'
              } ${isCurrent ? 'ring-2 ring-offset-2 ring-' + config.color + '-300' : ''}`}>
                <Icon size={20} />
              </div>
              <span className={`text-xs mt-1 text-center ${
                isCancelled ? 'text-red-600' : isActive ? `text-${config.color}-600 font-medium` : 'text-gray-400'
              }`}>
                {language === 'hi' ? config.labelHi : config.label}
              </span>
              {index < statuses.length - 1 && (
                <div className={`absolute h-0.5 w-1/4 ${
                  index < currentIndex && !isCancelled ? `bg-${STATUS_CONFIG[statuses[index+1]].color}-300` : 'bg-gray-200'
                }`} style={{ left: `${(index + 1) * 25}%`, top: '20px' }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'hi' ? 'कोई ऑर्डर नहीं' : 'No Orders Yet'}
        </h2>
        <p className="text-gray-600 mb-6">
          {language === 'hi' ? 'अभी shopping शुरू करें!' : 'Start shopping to place your first order!'}
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primaryDark"
        >
          {language === 'hi' ? 'खरीदारी करें' : 'Start Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {language === 'hi' ? '📦 मेरे ऑर्डर' : '📦 My Orders'}
      </h1>

      <div className="space-y-4">
        {orders.map(order => {
          const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusConfig.icon;
          
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      Order #{order.id?.slice(-6) || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('hi-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    <StatusIcon size={14} />
                    {language === 'hi' ? statusConfig.labelHi : statusConfig.label}
                  </span>
                </div>
                
                {/* Visual Timeline */}
                <OrderTimeline status={order.status} />
              </div>

              {/* Order Items */}
              <div className="p-4 space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image || 'https://i.ibb.co/0y6mX1D/placeholder.png'}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">{item.variant}</p>
                      )}
                      <p className="text-sm">
                        <span className="text-gray-500">{item.qty} × </span>
                        <span className="font-medium">₹{item.price}</span>
                        <span className="text-gray-400 ml-1">= ₹{item.subtotal}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{order.pricing?.finalTotal || order.totalPrice || 0}
                  </span>
                </div>
                
                {/* Delivery Info */}
                {order.shippingAddress && (
                  <div className="text-sm text-gray-600 mb-3">
                    <p className="font-medium">📍 {order.shippingAddress.fullAddress}</p>
                    <p className="text-gray-500">
                      ⏰ {TIME_SLOTS?.find(s => s.id === order.shippingAddress.timeSlot)?.label || order.shippingAddress.timeSlot}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Reorder Button */}
                  <button
                    onClick={() => {
                      // Add items back to cart (simplified)
                      toast.info(language === 'hi' ? 'Items कार्ट में जोड़े गए' : 'Items added to cart');
                      router.push('/shop/cart');
                    }}
                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primaryDark transition"
                  >
                    {language === 'hi' ? '🔄 फिर से ऑर्डर करें' : '🔄 Reorder'}
                  </button>
                  
                  {/* Contact Buttons */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => window.open(`tel:+918112294119`, '_self')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
                      >
                        <FiPhone size={16} />
                        {language === 'hi' ? 'कॉल' : 'Call'}
                      </button>
                      <button
                        onClick={() => {
                          const message = `Hi, regarding Order #${order.id?.slice(-6)}: `;
                          window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="px-4 py-2 border border-green-500 text-green-600 rounded-lg text-sm hover:bg-green-50 flex items-center gap-1"
                      >
                        <FiMessageCircle size={16} />
                        WhatsApp
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Time slots reference (same as cart page)
const TIME_SLOTS = [
  { id: 'morning', label: 'सुबह (8-12 बजे)' },
  { id: 'evening', label: 'शाम (4-8 बजे)' },
  { id: 'tomorrow', label: 'कल (कभी भी)' }
];
