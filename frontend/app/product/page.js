"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { uploadImageToImgBB } from '../../../lib/imgbb';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaUpload } from 'react-icons/fa';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Advanced Form State
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'vegetables', isActive: true,
    variants: [{ size: '1 kg', price: '', mrp: '', stock: '10' }]
  });
  
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      } else {
        setProducts([]);
      }
    });
  }, []);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', price: '', mrp: '', stock: '10' }]
    });
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (imagePreview) {
        imageUrl = await uploadImageToImgBB(imagePreview);
        if (!imageUrl) throw new Error("Image upload failed");
      }

      // Base price and stock defaults to first variant for simple listing
      const defaultVariant = formData.variants[0];

      const newProductData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isActive: formData.isActive,
        price: parseFloat(defaultVariant.price), // default for list view
        mrp: parseFloat(defaultVariant.mrp) || parseFloat(defaultVariant.price),
        unit: defaultVariant.size,
        stock: parseInt(defaultVariant.stock),
        variants: formData.variants, // Save advanced variants array
        image: imageUrl || '', // Will fallback gracefully if empty
        createdAt: Date.now()
      };

      await set(push(ref(db, 'products')), newProductData);

      toast.success("Product added successfully!");
      setShowForm(false);
      setFormData({ name: '', description: '', category: 'vegetables', isActive: true, variants: [{ size: '1 kg', price: '', mrp: '', stock: '10' }] });
      setImagePreview('');
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    await update(ref(db, `products/${id}`), { isActive: !currentStatus });
    toast.info(`Product marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to delete this product forever?")) {
      await remove(ref(db, `products/${id}`));
      toast.success("Product deleted");
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products Catalog</h1>
        <div className="flex gap-2">
          <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-200">
            <FaUpload /> Bulk CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600">
            {showForm ? 'Cancel' : <><FaPlus /> Add New</>}
          </button>
        </div>
      </div>
      
      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-green-200">
          <h2 className="text-xl font-bold mb-4 text-green-800">Add New Product (with variants)</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name (EN/HI)</label>
                <input type="text" required placeholder="e.g. Aashirvaad Atta / आशीर्वाद आटा" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50">
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="staples">Atta, Rice & Dal</option>
                  <option value="dairy">Dairy & Bakery</option>
                  <option value="spices">Spices & Masala</option>
                  <option value="snacks">Snacks & Biscuits</option>
                  <option value="personal_care">Personal Care</option>
                </select>
              </div>
            </div>

            {/* VARIANTS BUILDER */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                Pricing & Variants (Sizes)
                <button type="button" onClick={addVariant} className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-gray-300">
                  <FaPlus /> Add Size
                </button>
              </h3>
              
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex flex-wrap gap-2 items-end bg-white p-3 rounded-lg border shadow-sm">
                    <div className="flex-1 min-w-[100px]">
                      <label className="text-xs font-bold text-gray-500">Size/Unit</label>
                      <input type="text" placeholder="500g, 1kg..." required value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="w-full border-b-2 outline-none p-1 focus:border-primary" />
                    </div>
                    <div className="flex-1 min-w-[80px]">
                      <label className="text-xs font-bold text-gray-500">MRP (₹)</label>
                      <input type="number" placeholder="60" value={variant.mrp} onChange={(e) => handleVariantChange(index, 'mrp', e.target.value)} className="w-full border-b-2 outline-none p-1 focus:border-primary" />
                    </div>
                    <div className="flex-1 min-w-[80px]">
                      <label className="text-xs font-bold text-primary">Selling Price (₹)</label>
                      <input type="number" required placeholder="55" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full border-b-2 border-primary outline-none p-1 font-bold" />
                    </div>
                    <div className="flex-1 min-w-[80px]">
                      <label className="text-xs font-bold text-gray-500">Stock Qty</label>
                      <input type="number" required placeholder="10" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full border-b-2 outline-none p-1 focus:border-primary" />
                    </div>
                    {index > 0 && (
                      <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Image (Required)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border p-2 rounded-lg bg-gray-50" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 h-24 object-contain rounded-lg border" />}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-md active:scale-95 transition-all">
              {loading ? 'Saving to Database...' : 'Save Product'}
            </button>
          </form>
        </div>
      )}

      {/* Product List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Variants</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image ? <img src={product.image} className="object-contain h-full" /> : <span className="text-xs text-gray-400">No Img</span>}
                  </div>
                  <span className="font-bold">{product.name}</span>
                </td>
                <td className="p-4 capitalize">{product.category.replace('_', ' ')}</td>
                <td className="p-4 font-extrabold text-green-600">₹{product.price} <span className="text-xs text-gray-500 font-normal">/{product.unit}</span></td>
                <td className="p-4 text-xs font-mono bg-gray-50 rounded inline-block mt-4">{product.variants?.length || 1} size(s)</td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(product.id, product.isActive)} className="text-2xl">
                    {product.isActive ? <FaToggleOn className="text-primary" /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><FaEdit /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found. Add your first product!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
