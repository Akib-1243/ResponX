import MissingPersonModel from '../models/MissingPerson.js';

/* GET /api/missing-persons */
export const getAllMissingPersons = async (req, res) => {
  try {
    const { status, urgency, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { lastLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const persons = await MissingPersonModel.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: persons.length, data: persons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/missing-persons/:id */
export const getMissingPerson = async (req, res) => {
  try {
    const person = await MissingPersonModel.findById(req.params.id)
      .populate('reportedBy', 'name email');

    if (!person) {
      return res.status(404).json({ success: false, message: 'Missing person record not found.' });
    }
    res.status(200).json({ success: true, data: person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/missing-persons (authenticated) */
export const createMissingPerson = async (req, res) => {
  try {
    const { fullName, age, gender, vulnerability, lastLocation, description, contactNumber, urgency } = req.body;

    // Validate required fields
    if (!fullName || !age || !gender || !lastLocation || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const newPerson = await MissingPersonModel.create({
      fullName,
      age,
      gender,
      vulnerability: vulnerability || 'none',
      lastLocation,
      description: description || '',
      contactNumber,
      urgency: urgency || 'normal',
      status: 'missing',
      reportedBy: req.user._id,
      reportedAt: new Date()
    });

    await newPerson.populate('reportedBy', 'name email');

    res.status(201).json({ success: true, data: newPerson });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* PATCH /api/missing-persons/:id/found (volunteers/admins can mark as found) */
export const markAsFound = async (req, res) => {
  try {
    const person = await MissingPersonModel.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Missing person record not found.' });
    }

    if (person.status === 'found') {
      return res.status(400).json({ success: false, message: 'Person is already marked as found.' });
    }

    person.status = 'found';
    person.foundAt = new Date();
    await person.save();

    await person.populate('reportedBy', 'name email');

    res.status(200).json({ success: true, data: person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* DELETE /api/missing-persons/:id (admin only) */
export const deleteMissingPerson = async (req, res) => {
  try {
    const person = await MissingPersonModel.findByIdAndDelete(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Missing person record not found.' });
    }

    res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
