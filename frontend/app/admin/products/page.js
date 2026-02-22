"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { uploadImageToImgBB } from '../../../lib/imgbb';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'vegetables', stock: '', unit: 'kg', isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch Products
  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setProducts([]);
      }
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Base64 for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (imagePreview) {
        // Upload to ImgBB
        imageUrl = await uploadImageToImgBB(imagePreview);
        if (!imageUrl) throw new Error("Image upload failed");
      }

      const newProductRef = push(ref(db, 'products'));
      await set(newProductRef, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: imageUrl || 'https://i.ibb.co/0y6mX1D/placeholder.png',
        createdAt: Date.now()
      });

      toast.success("Product added successfully!");
      setFormData({ name: '', description: '', price: '', category: 'vegetables', stock: '', unit: 'kg', isActive: true });
      setImagePreview('');
      document.getElementById('imageInput').value = '';
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to delete this product?")) {
      await remove(ref(db, `products/${id}`));
      toast.success("Product deleted");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
      
      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Product Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border p-2 rounded" />
          <input type="number" step="0.01" placeholder="Price ($)" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="border p-2 rounded" />
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border p-2 rounded">
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="snacks">Snacks</option>
          </select>
          <input type="number" placeholder="Stock Quantity" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="border p-2 rounded" />
          <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="border p-2 rounded">
            <option value="kg">Kilogram (kg)</option>
            <option value="pcs">Pieces (pcs)</option>
            <option value="liter">Liter (L)</option>
          </select>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-2">Product Image</label>
            <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} className="border p-2 rounded w-full" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-contain" />}
          </div>

          <button type="submit" disabled={loading} className="md:col-span-2 bg-primary text-white py-3 rounded font-bold hover:bg-primaryDark disabled:bg-gray-400">
            {loading ? 'Uploading & Saving...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-700">
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b">
                <td className="p-4">
                  <div className="w-12 h-12 relative rounded overflow-hidden">
                    <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
                  </div>
                </td>
                <td className="p-4 font-bold">{product.name}</td>
                <td className="p-4">${product.price} /{product.unit}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
