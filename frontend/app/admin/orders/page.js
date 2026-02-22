"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { toast } from 'react-toastify';
import { FaWhatsapp, FaEye } from 'react-icons/fa';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert to array and sort by newest first
        const ordersArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        ordersArray.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await update(ref(db, `orders/${id}`), { status: newStatus });
      toast.success("Order status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 font-bold text-center animate-pulse">Loading Orders...</div>;

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Order Management</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-bold">Order ID & Time</th>
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Items</th>
              <th className="p-4 font-bold">Total Bill</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map(order => {
              // FIX: Handle both old format (totalPrice) and new format (billing.grandTotal)
              const totalAmount = order.billing?.grandTotal || order.totalPrice || 0;
              const date = new Date(order.createdAt).toLocaleString('en-IN');
              const itemCount = order.items?.length || 0;

              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-1">{date}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{order.customerEmail.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">{order.deliveryDetails?.landmark || "No landmark"}</p>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">
                    {itemCount} item(s)
                  </td>
                  <td className="p-4 font-extrabold text-green-600">
                    {/* Safe calculation prevents crashes */}
                    ₹{Number(totalAmount).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`border p-2 rounded-lg text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary
                        ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                        ${order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="processing">📦 Packing</option>
                      <option value="shipped">🚴 Out for Delivery</option>
                      <option value="delivered">✅ Delivered</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="View Details">
                      <FaEye />
                    </button>
                    <a href={`https://wa.me/?text=Hi, updating you on your order #${order.id.slice(-6).toUpperCase()}`} target="_blank" className="p-2 bg-[#25D366] text-white rounded-lg hover:bg-green-600" title="WhatsApp Customer">
                      <FaWhatsapp />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-10 text-center text-gray-500">No orders found yet.</div>
        )}
      </div>
    </div>
  );
}
