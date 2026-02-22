"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { FaMoneyBillWave, FaShoppingBag, FaUsers, FaBoxOpen } from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

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
        
        // Data processing for charts (Group by day)
        const dailyData = {};

        ordersArray.forEach(order => {
          // Overall Stats
          if (order.status === 'delivered') {
            rev += (order.billing?.grandTotal || order.totalPrice || 0);
            del++;
          }
          if (order.status === 'pending') pend++;

          // Chart Stats (Mocking day processing for beginner simplicity)
          const date = new Date(order.createdAt);
          const day = `${date.getDate()}/${date.getMonth()+1}`;
          
          if(!dailyData[day]) dailyData[day] = { name: day, Sales: 0, Orders: 0 };
          
          dailyData[day].Orders += 1;
          if (order.status === 'delivered') {
            dailyData[day].Sales += (order.billing?.grandTotal || order.totalPrice || 0);
          }
        });

        // Convert to array and take last 7 days
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Store Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your Kirana store's quick-commerce performance.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><FaMoneyBillWave /></div>
            <h3 className="text-gray-500 font-bold text-sm">Total Revenue</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">₹{stats.revenue.toFixed(0)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FaShoppingBag /></div>
            <h3 className="text-gray-500 font-bold text-sm">Total Orders</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500 transform rotate-45 translate-x-8 -translate-y-8"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><FaBoxOpen /></div>
            <h3 className="text-gray-500 font-bold text-sm">Pending</h3>
          </div>
          <p className="text-3xl font-extrabold text-yellow-600 relative z-10">{stats.pending} <span className="text-sm text-gray-400 font-normal">action needed</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><FaUsers /></div>
            <h3 className="text-gray-500 font-bold text-sm">Delivered</h3>
          </div>
          <p className="text-3xl font-extrabold text-purple-600">{stats.delivered}</p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Revenue Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Sales Trend (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <ChartTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="Sales" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Order Volume</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <ChartTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="Orders" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
