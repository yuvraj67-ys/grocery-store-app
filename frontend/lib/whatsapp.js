export const getWhatsAppLink = (cart, total, address, notes) => {
  const shopPhone = "918112294119"; // ⚠️ CHANGE THIS TO YOUR NUMBER

  let message = `🛒 *नया ऑर्डर (New Order)* 🛒\n\n`;
  message += `📦 *सामान (Items):*\n`;
  
  cart.forEach(item => {
    message += `• ${item.name} x ${item.qty} = ₹${(item.price * item.qty).toFixed(2)}\n`;
  });

  message += `\n💰 *कुल राशि (Total): ₹${total.toFixed(2)}*\n`;
  message += `💵 *पेमेंट: Cash on Delivery*\n\n`;
  
  message += `📍 *पता (Address):*\n`;
  if (address.landmark) message += `Landmark: ${address.landmark}\n`;
  message += `Time: ${address.timeSlot}\n`;
  if (notes) message += `📝 Notes: ${notes}\n`;

  message += `\n🙏 कृपया मेरा ऑर्डर कन्फर्म करें!`;

  return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
};
