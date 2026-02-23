"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { ref, push, set, runTransaction } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { FiMapPin, FiClock, FiMessageCircle, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

// Time slots for delivery (village-friendly)
const TIME_SLOTS = [
  { id: 'morning', label: 'सुबह (8-12 बजे)', labelEn: 'Morning (8AM-12PM)', available: true },
  { id: 'evening', label: 'शाम (4-8 बजे)', labelEn: 'Evening (4PM-8PM)', available: true },
  { id: 'tomorrow', label: 'कल (कभी भी)', labelEn: 'Tomorrow (Any Time)', available: true }
];

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, language } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    landmark: '',
    pincode: '',
    timeSlot: 'morning',
    notes: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !loading) {
      router.push('/shop');
    }
  }, [cart, loading, router]);

  // Calculate final price with delivery logic
  const calculateFinalTotal = () => {
    const deliveryFee = cartTotal >= 200 ? 0 : 15; // Free delivery above ₹200
    return cartTotal + deliveryFee;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error(language === 'hi' ? 'कृपया लॉगिन करें' : 'Please login to checkout');
      router.push('/login?redirect=/shop/cart');
      return;
    }

    if (!address.street || !address.pincode) {
      toast.error(language === 'hi' ? 'कृपया पूरा पता भरें' : 'Please fill complete address');
      return;
    }

    setLoading(true);

    try {
      // Validate stock before order (prevent overselling)
      for (const item of cart) {
        const productRef = ref(db, `products/${item.id}`);
        const snapshot = await runTransaction(productRef, (currentData) => {
          if (currentData === null) {
            toast.error(`${item.name} no longer available`);
            return;
          }
          if (currentData.stock < item.qty) {
            throw new Error(`${item.name} out of stock`);
          }
          return { ...currentData, stock: currentData.stock - item.qty };
        });
        
        if (!snapshot.committed) {
          throw new Error('Stock validation failed');
        }
      }

      // Create order in Firebase
      const orderRef = push(ref(db, 'orders'));
      const orderData = {
        id: orderRef.key,
        userId: user.uid,
        customerName: user.name || user.email,
        customerPhone: user.phone || '',
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          variant: item.variant || item.size,
          price: item.price,
          qty: item.qty,
          image: item.image,
          subtotal: item.price * item.qty
        })),
        shippingAddress: {
          ...address,
          fullAddress: `${address.street}, ${address.landmark}, PIN: ${address.pincode}`
        },
        pricing: {
          itemsTotal: cartTotal,
          deliveryFee: cartTotal >= 200 ? 0 : 15,
          discount: 0,
          finalTotal: calculateFinalTotal()
        },
        payment: {
          method: 'COD',
          status: 'pending'
        },
        status: 'pending', // pending → processing → out_for_delivery → delivered
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await set(orderRef, orderData);

      // Success!
      clearCart();
      toast.success(language === 'hi' ? '🎉 ऑर्डर सफलतापूर्वक placed!' : 'Order placed successfully!');
      
      // Send WhatsApp confirmation (optional)
      sendWhatsAppConfirmation(orderData);
      
      router.push('/shop/orders');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || (language === 'hi' ? 'ऑर्डर failed. दोबारा try करें' : 'Checkout failed. Try again'));
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp order confirmation
  const sendWhatsAppConfirmation = (order) => {
    const phone = '919876543210'; // 🔥 REPLACE WITH YOUR NUMBER
    const items = order.items.map(i => `• ${i.name}${i.variant ? ` (${i.variant})` : ''} x${i.qty} = ₹${i.subtotal}`).join('\n');
    const message = `
*🛒 NEW ORDER - FreshCart* 🛒

*Order ID:* ${order.id.slice(-6)}
*Customer:* ${order.customerName}

*📦 Items:*
${items}

*💰 Pricing:*
Items: ₹${order.pricing.itemsTotal}
Delivery: ${order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}
*TOTAL: ₹${order.pricing.finalTotal}*

*📍 Delivery:*
${order.shippingAddress.fullAddress}
⏰ ${TIME_SLOTS.find(s => s.id === order.shippingAddress.timeSlot)?.label}

*💵 Payment: Cash on Delivery*

🙏 Please confirm. Thank you!
    `.trim();

    // Open WhatsApp (user must confirm send)
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'hi' ? 'आपका कार्ट खाली है' : 'Your cart is empty'}
        </h2>
        <p className="text-gray-600 mb-6">
          {language === 'hi' ? 'अभी shopping शुरू करें!' : 'Start shopping to add items!'}
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {language === 'hi' ? '🛒 Shopping Cart' : '🛒 Shopping Cart'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4 flex gap-4">
              {/* Product Image */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.image || 'https://i.ibb.co/0y6mX1D/placeholder.png'}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                {item.variant && (
                  <p className="text-sm text-gray-500">{item.variant}</p>
                )}
                <p className="text-primary font-bold mt-1">
                  ₹{item.price.toFixed(2)} <span className="text-sm font-normal text-gray-500">/ {item.unit}</span>
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.qty - 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="font-bold w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.qty + 1)}
                    disabled={item.stock <= item.qty}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiPlus size={16} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>

                {/* Stock warning */}
                {item.stock <= 5 && item.stock > item.qty && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Only {item.stock} left in stock
                  </p>
                )}
              </div>

              {/* Subtotal */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg">₹{(item.price * item.qty).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-5 sticky top-20">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            {/* Price Breakdown */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cart.reduce((a, c) => a + c.qty, 0)})</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={cartTotal >= 200 ? 'text-green-600' : ''}>
                  {cartTotal >= 200 ? 'FREE' : `₹15`}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Address Form */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiMapPin className="text-primary" />
                {language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}
              </div>
              
              <input
                type="text"
                placeholder={language === 'hi' ? 'पता (मकान नंबर, गली)' : 'Address (House no, Street)'}
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm"
                required
              />
              
              <input
                type="text"
                placeholder={language === 'hi' ? 'लैंडमार्क (वैकल्पिक)' : 'Landmark (Optional)'}
                value={address.landmark}
                onChange={(e) => setAddress({...address, landmark: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm"
              />
              
              <input
                type="text"
                placeholder="PIN Code *"
                value={address.pincode}
                onChange={(e) => setAddress({...address, pincode: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />

              {/* Time Slot */}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-3">
                <FiClock className="text-primary" />
                {language === 'hi' ? 'डिलीवरी समय' : 'Preferred Time'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setAddress({...address, timeSlot: slot.id})}
                    className={`p-2 text-xs rounded-lg border transition ${
                      address.timeSlot === slot.id
                        ? 'border-primary bg-green-50 text-primary font-bold'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {language === 'hi' ? slot.label : slot.labelEn}
                  </button>
                ))}
              </div>

              {/* Order Notes */}
              <textarea
                placeholder={language === 'hi' ? 'अतिरिक्त निर्देश (जैसे: "घंटी बजाएं")' : 'Delivery instructions (e.g., "Ring bell")'}
                value={address.notes}
                onChange={(e) => setAddress({...address, notes: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm resize-none"
                rows={2}
              />
            </div>

            {/* COD Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                💵 {language === 'hi' 
                  ? 'कैश ऑन डिलीवरी: डिलीवरी पर ₹' + calculateFinalTotal().toFixed(2) + ' दें' 
                  : 'Cash on Delivery: Pay ₹' + calculateFinalTotal().toFixed(2) + ' when delivered'}
              </p>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primaryDark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {language === 'hi' ? '🛒 ऑर्डर करें' : '🛒 Place Order'} - ₹{calculateFinalTotal().toFixed(2)}
                </>
              )}
            </button>

            {/* WhatsApp Fallback Button */}
            <button
              onClick={() => {
                const items = cart.map(i => `• ${i.name} x${i.qty} = ₹${i.price*i.qty}`).join('\n');
                const message = `*Cart Items:*\n${items}\n\n*Total: ₹${calculateFinalTotal()}*\n📍 ${address.street || 'Address not set'}\n💵 Cash on Delivery\n\nPlease confirm my order!`;
                window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm"
            >
              <FiMessageCircle /> {language === 'hi' ? 'WhatsApp पर ऑर्डर करें' : 'Order via WhatsApp'}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => router.push('/shop')}
              className="w-full mt-2 text-primary hover:text-primaryDark text-sm font-medium"
            >
              ← {language === 'hi' ? 'वापस खरीदारी करें' : 'Continue Shopping'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
