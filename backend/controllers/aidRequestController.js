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

/* PUT /api/requests/:id/accept  (volunteer accepts request) */
export const acceptRequest = async (req, res) => {
  try {
    const request = await AidRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.assignedTo) {
      return res.status(400).json({ success: false, message: 'Request is already assigned to another volunteer.' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Request is not available for assignment.' });
    }

    request.assignedTo = req.user._id;
    request.status = 'in-progress';
    await request.save();

    await request.populate('submittedBy', 'name email');
    await request.populate('assignedTo', 'name email');

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* PUT /api/requests/:id/complete  (assigned volunteer marks as done) */
export const completeRequest = async (req, res) => {
  try {
    const request = await AidRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (!request.assignedTo || request.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this request.' });
    }

    if (request.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Request is not in progress.' });
    }

    request.status = 'resolved';
    await request.save();

    await request.populate('submittedBy', 'name email');
    await request.populate('assignedTo', 'name email');

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
