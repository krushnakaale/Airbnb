const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Use memory storage instead of old multer-storage-cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { cloudinary, upload };
