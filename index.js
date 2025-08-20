import { v2 as cloudinary } from 'cloudinary';

(async function() {
  cloudinary.config({ 
    cloud_name: 'drcpslfrz', 
    api_key: '561268345467682', 
    api_secret: '9rgaPDVLKRwHZKoVtuBZRBjWiY0' 
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(
      'C:/Users/Misbah/Desktop/REPRESENT/public/assets/owners/baggy-cargo-pant_1.webp', 
      { public_id: 'baggy-cargo-pant' }
    );

    console.log("✅ Uploaded:", uploadResult.secure_url);

    const optimizeUrl = cloudinary.url('baggy-cargo-pant', {
      fetch_format: 'auto',
      quality: 'auto'
    });
    console.log("⚡ Optimized:", optimizeUrl);

    const autoCropUrl = cloudinary.url('baggy-cargo-pant', {
      crop: 'auto',
      gravity: 'auto',
      width: 500,
      height: 500,
    });
    console.log("✂️ Cropped:", autoCropUrl);
    
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
})();
