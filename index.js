import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "drcpslfrz",
  api_key: "561268345467682",
  api_secret: "9rgaPDVLKRwHZKoVtuBZRBjWiY0",
});

// Folder you want to upload
const folderPath = "C:/Users/Misbah/Desktop/REPRESENT/public/assets/owners";

// Optional: prefix folder inside Cloudinary
const cloudFolder = "owners";

async function uploadFolder(localFolder) {
  const files = fs.readdirSync(localFolder);

  for (const file of files) {
    const filePath = path.join(localFolder, file);

    // skip if not an image
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

    const baseName = path.parse(file).name; // e.g. "baggy-cargo-pant_1"

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `${cloudFolder}/${baseName}`, // will be like "owners/baggy-cargo-pant_1"
        folder: cloudFolder, // optional but good for organization
      });

      console.log("✅ Uploaded:", result.secure_url);
    } catch (err) {
      console.error("❌ Failed:", file, err.message);
    }
  }
}

// Run the upload
uploadFolder(folderPath);
