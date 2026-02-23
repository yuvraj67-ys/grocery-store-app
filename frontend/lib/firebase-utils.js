// Optimized Firebase helpers to reduce read costs + improve performance
import { db } from './firebase';
import { ref, query, orderByChild, limitToFirst, startAt, endAt, get } from 'firebase/database';

// Fetch limited products with filters (for homepage/shop)
export const fetchProducts = async ({ 
  category = null, 
  search = '', 
  limit = 50,
  onlyActive = true 
} = {}) => {
  let productsRef = ref(db, 'products');
  
  // Build query with indexes
  if (onlyActive) {
    productsRef = query(productsRef, orderByChild('isActive'));
  }
  
  if (category) {
    productsRef = query(productsRef, orderByChild('category'), startAt(category), endAt(category + '\uf8ff'));
  }
  
  // Always limit results to control read costs
  productsRef = query(productsRef, limitToFirst(limit));
  
  try {
    const snapshot = await get(productsRef);
    if (!snapshot.exists()) return [];
    
    const products = [];
    snapshot.forEach(child => {
      const data = child.val();
      // Filter client-side for search (simpler than complex Firebase queries)
      if (!search || 
          data.name?.toLowerCase().includes(search.toLowerCase()) ||
          data.nameHi?.toLowerCase().includes(search.toLowerCase()) ||
          data.description?.toLowerCase().includes(search.toLowerCase())) {
        products.push({ id: child.key, ...data });
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch single product with variant support
export const fetchProduct = async (productId) => {
  try {
    const productRef = ref(db, `products/${productId}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Fetch user orders with limit
export const fetchUserOrders = async (userId, limit = 20) => {
  try {
    const ordersRef = query(
      ref(db, 'orders'),
      orderByChild('userId'),
      startAt(userId),
      endAt(userId),
      limitToFirst(limit)
    );
    
    const snapshot = await get(ordersRef);
    if (!snapshot.exists()) return [];
    
    const orders = [];
    snapshot.forEach(child => {
      orders.push({ id: child.key, ...child.val() });
    });
    
    // Sort by newest first
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Update product stock (with validation)
export const updateStock = async (productId, quantity, operation = 'decrease') => {
  const productRef = ref(db, `products/${productId}`);
  
  try {
    const snapshot = await get(productRef);
    if (!snapshot.exists()) throw new Error('Product not found');
    
    const current = snapshot.val();
    const newStock = operation === 'decrease' 
      ? current.stock - quantity 
      : current.stock + quantity;
    
    if (newStock < 0) throw new Error('Insufficient stock');
    
    // Update in database
    // Note: For production, use Firebase transactions for concurrency safety
    await set(productRef, { ...current, stock: newStock, updatedAt: Date.now() });
    
    return { success: true, newStock };
  } catch (error) {
    console.error('Stock update error:', error);
    throw error;
  }
};

// Helper: Format currency for display
export const formatPrice = (price, currency = 'INR') => {
  return new Intl.NumberFormat('hi-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

// Helper: Format date for Indian users
export const formatDate = (timestamp, showTime = false) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(showTime && { hour: '2-digit', minute: '2-digit' })
  });
};
