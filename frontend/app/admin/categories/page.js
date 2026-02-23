"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { uploadImageToImgBB } from '../../../lib/imgbb';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', id: '' });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    onValue(ref(db, 'categories'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCategories(Object.keys(data).map(key => ({ dbKey: key, ...data[key] })));
      else setCategories([]);
    });
  }, []);

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
      if (!imagePreview) throw new Error("Please select an image");
      const imageUrl = await uploadImageToImgBB(imagePreview);
      if (!imageUrl) throw new Error("Image upload failed");

      // Auto generate ID (slug) if empty (e.g., "Fresh Fruits" -> "fresh_fruits")
      const catId = formData.id || formData.name.toLowerCase().replace(/\s+/g, '_');

      await set(push(ref(db, 'categories')), {
        name: formData.name,
        id: catId,
        image: imageUrl,
        createdAt: Date.now()
      });

      toast.success("Category added!");
      setFormData({ name: '', id: '' });
      setImagePreview('');
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (dbKey) => {
    if(confirm("Delete this category?")) await remove(ref(db, `categories/${dbKey}`));
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      
      {/* Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 max-w-2xl">
        <h2 className="font-bold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Category Name (e.g. Fresh Fruits / ताज़ा फल)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
          <input type="text" placeholder="Category ID (e.g. fruits) - Optional" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50 text-sm" />
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category Image/Icon</label>
            <input type="file" accept="image/*" required onChange={handleImageChange} className="w-full border p-2 rounded-lg bg-gray-50" />
            {imagePreview && <img src={imagePreview} className="mt-2 h-16 object-contain" />}
          </div>

          <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">
            {loading ? 'Saving...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map(cat => (
          <div key={cat.dbKey} className="bg-white p-4 rounded-2xl shadow-sm border text-center relative group">
            <button onClick={() => handleDelete(cat.dbKey)} className="absolute top-2 right-2 text-red-500 bg-red-50 p-2 rounded-full hidden group-hover:block"><FaTrash size={12}/></button>
            <div className="w-16 h-16 mx-auto relative mb-2">
              <Image src={cat.image} alt={cat.name} layout="fill" objectFit="contain" />
            </div>
            <p className="font-bold text-sm text-gray-800">{cat.name}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-1">{cat.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
