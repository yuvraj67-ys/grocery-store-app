"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, pending: 0 });

  useEffect(() => {
    onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let rev = 0, pend = 0;
        const ordersArray = Object.values(data);
        ordersArray.forEach(order => {
          if (order.status === 'delivered') rev += order.totalPrice;
          if (order.status === 'pending') pend++;
        });
        setStats({ revenue: rev, totalOrders: ordersArray.length, pending: pend });
      }
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Shop Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
          <h3 className="text-gray-500 font-bold mb-1">Total Earned (Delivered)</h3>
          <p className="text-4xl font-extrabold text-green-600">₹{stats.revenue.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <h3 className="text-gray-500 font-bold mb-1">Total Orders</h3>
          <p className="text-4xl font-extrabold text-blue-600">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-gray-500 font-bold mb-1">Pending Orders</h3>
          <p className="text-4xl font-extrabold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a href="/admin/orders" className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-blue-200">View Pending Orders</a>
          <a href="/admin/products" className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-200">Update Stock</a>
        </div>
      </div>
    </div>
  );
}
