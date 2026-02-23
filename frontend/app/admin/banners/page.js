"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { uploadImageToImgBB } from '../../../lib/imgbb';
import { toast } from 'react-toastify';
import { FaTrash, FaLink } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', link: '' });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    onValue(ref(db, 'banners'), (snapshot) => {
      const data = snapshot.val();
      if (data) setBanners(Object.keys(data).map(key => ({ dbKey: key, ...data[key] })));
      else setBanners([]);
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
      if (!imagePreview) throw new Error("Please select a banner image");
      const imageUrl = await uploadImageToImgBB(imagePreview);
      
      await set(push(ref(db, 'banners')), {
        title: formData.title || 'Promo Banner',
        link: formData.link || '', // Link is optional
        image: imageUrl,
        createdAt: Date.now()
      });

      toast.success("Banner added!");
      setFormData({ title: '', link: '' });
      setImagePreview('');
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (dbKey) => {
    if(confirm("Delete this banner?")) await remove(ref(db, `banners/${dbKey}`));
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Homepage Banners</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 max-w-2xl">
        <h2 className="font-bold mb-4">Upload New Banner</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Banner Title (Internal use)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
          
          <div className="flex gap-2">
            <div className="bg-gray-100 p-3 rounded-lg text-gray-500"><FaLink /></div>
            <input type="text" placeholder="Link on click? (Optional, e.g. /search?category=fruits)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full border p-3 rounded-lg bg-gray-50" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Banner Image (Recommended: 1200x400px)</label>
            <input type="file" accept="image/*" required onChange={handleImageChange} className="w-full border p-2 rounded-lg bg-gray-50" />
            {imagePreview && <img src={imagePreview} className="mt-3 w-full h-32 object-cover rounded-xl border" />}
          </div>

          <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">
            {loading ? 'Uploading...' : 'Publish Banner'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div key={banner.dbKey} className="bg-white rounded-2xl shadow-sm border overflow-hidden relative group">
            <button onClick={() => handleDelete(banner.dbKey)} className="absolute top-2 right-2 text-white bg-red-500 p-2 rounded-full z-10 shadow-md hover:scale-110 transition"><FaTrash size={12}/></button>
            <div className="w-full h-40 relative bg-gray-100">
              <Image src={banner.image} alt={banner.title} layout="fill" objectFit="cover" />
            </div>
            <div className="p-4 flex justify-between items-center bg-gray-50">
              <p className="font-bold text-gray-800">{banner.title}</p>
              {banner.link ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1"><FaLink/> Has Link</span>
              ) : (
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md">No Link</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
