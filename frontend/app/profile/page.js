"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUserCircle, FaBox, FaSignOutAlt, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user's orders
    onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allOrders = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        // Filter only this user's orders
        const myOrders = allOrders.filter(o => o.userId === user.uid).sort((a, b) => b.createdAt - a.createdAt);
        setOrders(myOrders);
      }
      setLoading(false);
    });
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
      {/* Profile Header */}
      <div className="bg-white p-6 shadow-sm flex items-center gap-4 mb-2">
        <FaUserCircle className="text-6xl text-gray-300" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">{user.name || 'My Account'}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
            Verified Customer
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white shadow-sm mb-2">
        <div className="p-4 border-b flex items-center justify-between text-gray-700 font-medium">
          <div className="flex items-center gap-3"><FaMapMarkerAlt className="text-primary"/> Saved Addresses</div>
          <FaChevronRight className="text-gray-300 text-sm"/>
        </div>
        <button onClick={logout} className="w-full p-4 flex items-center justify-between text-red-500 font-bold hover:bg-red-50 transition">
          <div className="flex items-center gap-3"><FaSignOutAlt /> Logout</div>
        </button>
      </div>

      {/* Order History */}
      <div className="bg-white shadow-sm p-4 min-h-[50vh]">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaBox className="text-primary" /> My Orders
        </h2>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
            <Link href="/" className="text-primary font-bold mt-2 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link href={`/orders/${order.id}`} key={order.id} className="block border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-gray-600">{order.items?.length || 0} Items</p>
                  <p className="font-extrabold text-black">₹{Number(order.billing?.grandTotal || order.totalPrice).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
