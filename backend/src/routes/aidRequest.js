const express = require('express');
const router = express.Router();
const AidRequest = require('../models/AidRequest');
const auth = require('../middleware/auth');

// Submit aid request (victim)
router.post('/submit', auth, async (req, res) => {
  try {
    const { name, phone, people, location, urgency, needs, description } = req.body;

    const aidRequest = await AidRequest.create({
      victim: req.user.id,
      name,
      phone,
      people,
      location,
      urgency,
      needs,
      description,
    });

    res.status(201).json(aidRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all aid requests (volunteer/admin)
router.get('/all', auth, async (req, res) => {
  try {
    const requests = await AidRequest.find()
      .populate('victim', 'name email')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept aid request (volunteer)
router.put('/accept/:id', auth, async (req, res) => {
  try {
    const request = await AidRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted', acceptedBy: req.user.id },
      { new: true }
    );

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;