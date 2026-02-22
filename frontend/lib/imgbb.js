export const uploadImageToImgBB = async (base64String) => {
  try {
    // 1. Strip the prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.split(',')[1];
    
    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append('image', base64Data);

    // 3. Send to ImgBB using your exact key
    const response = await fetch('https://api.imgbb.com/1/upload?key=754fb1f38b724ff3f863299e38fcab47', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url; // Returns the hosted image URL
    } else {
      throw new Error("ImgBB Upload Failed");
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
};
