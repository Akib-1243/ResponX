import { cloudinary } from '../config/cloudinary.js';
import Photo from '../models/Photo.js';

export const createPhoto = async (req, res) => {
  try {
    const { data, caption } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, message: 'Photo data is required' });
    }

    console.log('Uploading to Cloudinary...');
    
    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: 'responx',
      public_id: `photo_${Date.now()}`,
    });

    console.log('Cloudinary upload successful:', uploadResponse.secure_url);

    // Save metadata to database
    const photo = await Photo.create({
      url: uploadResponse.secure_url,
      caption: caption?.trim() || 'Untitled',
      uploadedBy: req.user?._id,
    });

    console.log('Photo saved to database');

    return res.status(201).json({ success: true, data: photo });
  } catch (error) {
    console.error('Photo upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload photo',
    });
  }
};


export const getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');
    
    return res.json({ success: true, data: photos });
  } catch (error) {
    console.error('Failed to load photos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load photos',
    });
  }
};
