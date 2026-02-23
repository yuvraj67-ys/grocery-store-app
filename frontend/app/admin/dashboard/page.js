"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { FaMoneyBillWave, FaShoppingBag, FaUsers, FaBoxOpen } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, pending: 0, delivered: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let rev = 0, pend = 0, del = 0;
        const ordersArray = Object.values(data);
        const dailyData = {};

        ordersArray.forEach(order => {
          if (order.status === 'delivered') { rev += (order.billing?.grandTotal || order.totalPrice || 0); del++; }
          if (order.status === 'pending') pend++;

          const date = new Date(order.createdAt);
          const day = `${date.getDate()}/${date.getMonth()+1}`;
          
          if(!dailyData[day]) dailyData[day] = { name: day, Sales: 0, Orders: 0 };
          dailyData[day].Orders += 1;
          if (order.status === 'delivered') dailyData[day].Sales += (order.billing?.grandTotal || order.totalPrice || 0);
        });

        const finalChartData = Object.values(dailyData).slice(-7);
        setStats({ revenue: rev, totalOrders: ordersArray.length, pending: pend, delivered: del });
        setChartData(finalChartData);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 font-bold animate-pulse text-gray-500">Loading Analytics...</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Store Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border"><div className="p-3 bg-green-100 text-green-600 rounded-lg w-min mb-2"><FaMoneyBillWave /></div><h3 className="text-gray-500 font-bold text-sm">Revenue</h3><p className="text-3xl font-extrabold text-gray-900">₹{stats.revenue.toFixed(0)}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg w-min mb-2"><FaShoppingBag /></div><h3 className="text-gray-500 font-bold text-sm">Total Orders</h3><p className="text-3xl font-extrabold text-gray-900">{stats.totalOrders}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border"><div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg w-min mb-2"><FaBoxOpen /></div><h3 className="text-gray-500 font-bold text-sm">Pending</h3><p className="text-3xl font-extrabold text-yellow-600">{stats.pending}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border"><div className="p-3 bg-purple-100 text-purple-600 rounded-lg w-min mb-2"><FaUsers /></div><h3 className="text-gray-500 font-bold text-sm">Delivered</h3><p className="text-3xl font-extrabold text-purple-600">{stats.delivered}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Sales Trend</h3>
          <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="name" /><YAxis /><ChartTooltip /><Line type="monotone" dataKey="Sales" stroke="#10B981" strokeWidth={4} /></LineChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Order Volume</h3>
          <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><ChartTooltip /><Bar dataKey="Orders" fill="#3B82F6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
}
