"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert to array and sort by newest
        const ordersArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        ordersArray.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(ordersArray);
      }
    });
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await update(ref(db, `orders/${id}`), { status: newStatus });
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Items</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b">
                <td className="p-4 text-xs font-mono">{order.id}</td>
                <td className="p-4">{order.customerEmail}</td>
                <td className="p-4 font-bold text-primary">${order.totalPrice.toFixed(2)}</td>
                <td className="p-4">{order.items?.length || 0} items</td>
                <td className="p-4">
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border p-1 rounded text-sm bg-gray-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
