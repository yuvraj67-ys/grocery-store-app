"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { uploadImageToImgBB } from '../../../lib/imgbb';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); // NEW: Track which product is being edited
  
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', isActive: true,
    variants: [{ size: '1 kg', price: '', mrp: '', stock: '10' }]
  });
  const [imagePreview, setImagePreview] = useState('');

  // Fetch Products & Categories
  useEffect(() => {
    // Products
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      else setProducts([]);
    });

    // Categories (Dynamic dropdown fix)
    onValue(ref(db, 'categories'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const catArray = Object.values(data);
        setDynamicCategories(catArray);
        if(catArray.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: catArray[0].id }));
        }
      }
    });
  }, []);

  // Form Handlers
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };
  const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { size: '', price: '', mrp: '', stock: '10' }] });
  const removeVariant = (index) => setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // EDIT BUTTON LOGIC (FIX)
  const handleEditClick = (product) => {
    setEditId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || (dynamicCategories[0]?.id || ''),
      isActive: product.isActive ?? true,
      variants: product.variants || [{ size: product.unit || '', price: product.price || '', mrp: product.mrp || '', stock: product.stock || '10' }]
    });
    setImagePreview(product.image || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // RESET FORM
  const resetForm = () => {
    setEditId(null);
    setShowForm(false);
    setImagePreview('');
    setFormData({ 
      name: '', description: '', category: dynamicCategories[0]?.id || '', isActive: true, 
      variants: [{ size: '1 kg', price: '', mrp: '', stock: '10' }] 
    });
  };

  // SUBMIT (ADD OR UPDATE) LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = imagePreview; // Assume it's an existing URL from edit mode

      // Only upload to ImgBB if it's a NEW base64 file (starts with data:image)
      if (imagePreview && imagePreview.startsWith('data:image')) {
        imageUrl = await uploadImageToImgBB(imagePreview);
        if (!imageUrl) throw new Error("Image upload failed");
      }

      const defaultVariant = formData.variants[0];

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category || (dynamicCategories[0]?.id || 'general'),
        isActive: formData.isActive,
        price: parseFloat(defaultVariant.price), 
        mrp: parseFloat(defaultVariant.mrp) || parseFloat(defaultVariant.price),
        unit: defaultVariant.size,
        stock: parseInt(defaultVariant.stock),
        variants: formData.variants, 
        image: imageUrl || '/placeholder.svg',
        updatedAt: Date.now()
      };

      if (editId) {
        // UPDATE EXISTING PRODUCT
        await update(ref(db, `products/${editId}`), productData);
        toast.success("Product Updated Successfully!");
      } else {
        // ADD NEW PRODUCT
        productData.createdAt = Date.now();
        await set(push(ref(db, 'products')), productData);
        toast.success("New Product Added!");
      }

      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    await update(ref(db, `products/${id}`), { isActive: !currentStatus });
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
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className={`${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-primary hover:bg-green-600'} text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2`}>
          {showForm ? 'Cancel' : <><FaPlus /> Add New</>}
        </button>
      </div>
      
      {/* Form (Add / Edit) */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-primary mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{editId ? '✏️ Edit Product' : '📦 Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category (Dynamic)</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50">
                  <option value="" disabled>Select Category</option>
                  {dynamicCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  {dynamicCategories.length === 0 && <option value="general">Default Category (Please create categories first)</option>}
                </select>
              </div>
            </div>

            {/* VARIANTS */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex justify-between">
                Pricing & Sizes
                <button type="button" onClick={addVariant} className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-md flex items-center gap-1"><FaPlus /> Add Variant</button>
              </h3>
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex flex-wrap gap-2 items-end bg-white p-3 rounded-lg border shadow-sm">
                    <div className="flex-1 min-w-[100px]"><label className="text-xs font-bold text-gray-500">Size (1kg, 500g)</label><input type="text" required value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="w-full border-b-2 p-1 focus:border-primary outline-none" /></div>
                    <div className="flex-1 min-w-[80px]"><label className="text-xs font-bold text-gray-500">MRP (₹)</label><input type="number" value={variant.mrp} onChange={(e) => handleVariantChange(index, 'mrp', e.target.value)} className="w-full border-b-2 p-1 focus:border-primary outline-none" /></div>
                    <div className="flex-1 min-w-[80px]"><label className="text-xs font-bold text-primary">Selling Price (₹)</label><input type="number" required value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full border-b-2 border-primary font-bold p-1 outline-none" /></div>
                    <div className="flex-1 min-w-[80px]"><label className="text-xs font-bold text-gray-500">Stock</label><input type="number" required value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full border-b-2 p-1 focus:border-primary outline-none" /></div>
                    {index > 0 && <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500"><FaTrash /></button>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Image {editId && "(Leave empty to keep current image)"}</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border p-2 rounded-lg bg-gray-50" />
              {imagePreview && <img src={imagePreview} className="mt-3 h-24 object-contain rounded-lg border bg-white p-1" />}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-md transition-all">
              {loading ? 'Saving to Database...' : (editId ? 'Update Product' : 'Publish Product')}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 relative bg-gray-100 rounded-lg flex-shrink-0">
                    <Image src={product.image || '/placeholder.svg'} layout="fill" objectFit="contain" className="p-1" alt={product.name}/>
                  </div>
                  <span className="font-bold">{product.name}</span>
                </td>
                <td className="p-4 capitalize">{product.category}</td>
                <td className="p-4 font-extrabold text-green-600">₹{product.price} <span className="text-xs text-gray-500 font-normal">/{product.unit}</span></td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(product.id, product.isActive)} className="text-2xl">{product.isActive ? <FaToggleOn className="text-primary" /> : <FaToggleOff className="text-gray-400" />}</button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleEditClick(product)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><FaEdit /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
