import AidRequest from '../models/AidRequest.js';

/* GET /api/requests */
export const getAllRequests = async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const filter = {};
    if (status)  filter.status  = status;
    if (urgency) filter.urgency = urgency;

    const requests = await AidRequest.find(filter)
      .populate('submittedBy', 'name email')
      .populate('assignedTo',  'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/requests/:id */
export const getRequest = async (req, res) => {
  try {
    const request = await AidRequest.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo',  'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/requests  (authenticated) */
export const createRequest = async (req, res) => {
  try {
    const request = await AidRequest.create({ ...req.body, submittedBy: req.user._id });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* PUT /api/requests/:id  (admin or assigned volunteer) */
export const updateRequest = async (req, res) => {
  try {
    const request = await AidRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* DELETE /api/requests/:id  (admin only) */
export const deleteRequest = async (req, res) => {
  try {
    const request = await AidRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    res.status(200).json({ success: true, message: 'Request deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
