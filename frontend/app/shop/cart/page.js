"use client";
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      router.push('/login');
      return;
    }

    try {
      const orderRef = push(ref(db, 'orders'));
      await set(orderRef, {
        userId: user.uid,
        customerEmail: user.email,
        items: cart,
        totalPrice: cartTotal,
        status: 'pending',
        paymentMethod: 'Cash on Delivery',
        createdAt: Date.now()
      });
      
      clearCart();
      toast.success("Order placed successfully! (Cash on Delivery)");
      router.push('/shop');
    } catch (error) {
      toast.error("Checkout failed. Try again.");
    }
  };

  if (cart.length === 0) return <div className="text-center mt-20 text-2xl font-bold text-gray-500">Your cart is empty 🛒</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b py-4 last:border-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 relative rounded overflow-hidden">
                <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
              </div>
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-gray-500">${item.price}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="px-3 py-1 bg-gray-100">-</button>
                <span className="px-4">{item.qty}</span>
                <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="px-3 py-1 bg-gray-100">+</button>
              </div>
              <p className="font-bold w-16 text-right">${(item.price * item.qty).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-bold ml-4">X</button>
            </div>
          </div>
        ))}
        
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-3xl font-extrabold text-primary">${cartTotal.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={handleCheckout} 
          className="w-full mt-6 bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition"
        >
          Proceed to Checkout (COD)
        </button>
      </div>
    </div>
  );
}
