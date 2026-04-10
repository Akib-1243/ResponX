import Shelter from '../models/Shelter.js';

/* GET /api/shelters */
export const getAllShelters = async (req, res) => {
  try {
    const { open, status, search } = req.query;
    const filter = {};

    if (open !== undefined) filter.open = open === 'true';
    if (status)             filter.status = status;
    if (search)             filter.name = { $regex: search, $options: 'i' };

    const shelters = await Shelter.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: shelters.length, data: shelters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/shelters/:id */
export const getShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id).populate('createdBy', 'name email');
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }
    res.status(200).json({ success: true, data: shelter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/shelters  (admin only) */
export const createShelter = async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      phone,
      total,
      capacity = 0,
      amenities = [],
      open = true,
    } = req.body;

    const shelterData = {
      name: name?.trim(),
      location: location?.trim(),
      address: address?.trim(),
      phone: phone?.trim(),
      total: Number(total),
      capacity: Number(capacity),
      amenities: Array.isArray(amenities) ? amenities : [],
      open: open === false || open === 'false' ? false : true,
      createdBy: req.user._id,
    };

    if (!shelterData.name || !shelterData.location || !shelterData.address || !shelterData.phone) {
      return res.status(400).json({ success: false, message: 'All shelter fields are required.' });
    }

    if (!shelterData.total || shelterData.total < 1) {
      return res.status(400).json({ success: false, message: 'Total capacity must be at least 1.' });
    }

    if (shelterData.capacity < 0) {
      return res.status(400).json({ success: false, message: 'Occupancy cannot be negative.' });
    }

    if (shelterData.capacity > shelterData.total) {
      return res.status(400).json({ success: false, message: 'Occupancy cannot exceed total capacity.' });
    }

    const shelter = await Shelter.create(shelterData);
    res.status(201).json({ success: true, data: shelter });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(error => error.message).join(' ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* PUT /api/shelters/:id  (admin only) */
export const updateShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }
    res.status(200).json({ success: true, data: shelter });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* DELETE /api/shelters/:id  (admin only) */
export const deleteShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }
    res.status(200).json({ success: true, message: 'Shelter deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
