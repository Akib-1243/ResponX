import { cloudinary } from '../config/cloudinary.js';
import Photo from '../models/Photo.js';

export const createPhoto = async (req, res) => {
  try {
    const { data, caption, category } = req.body;

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
      publicId: uploadResponse.public_id || '',
      caption: caption?.trim() || 'Untitled',
      category: category?.trim() || 'Aid',
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

export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }

    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (err) {
        console.warn('Cloudinary deletion failed, continuing to remove DB record:', err.message);
      }
    }

    await photo.deleteOne();
    return res.status(200).json({ success: true, message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Photo delete error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete photo' });
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
