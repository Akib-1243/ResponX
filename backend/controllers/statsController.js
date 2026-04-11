import Shelter from '../models/Shelter.js';
import AidRequest from '../models/AidRequest.js';
import userModel from '../models/userModel.js';

export const getPublicStats = async (req, res) => {
  try {
    const shelters = await Shelter.find({}).sort({ createdAt: -1 }).lean();
    const openRequests = await AidRequest.find({ status: 'open' }).sort({ createdAt: -1 }).lean();
    const resolvedRequestsCount = await AidRequest.countDocuments({ status: 'resolved' });
    const assistedTodayCount = await AidRequest.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    const activeVolunteers = await userModel.countDocuments({ role: 'volunteer' });

    const totalShelters = shelters.length;
    const openShelters = shelters.filter((shelter) => shelter.open).length;
    const peopleSheltered = shelters.reduce((sum, shelter) => sum + (Number(shelter.capacity) || 0), 0);

    const topShelters = shelters.slice(0, 3).map((shelter) => ({
      _id: shelter._id,
      name: shelter.name,
      capacity: shelter.capacity,
      total: shelter.total,
      open: shelter.open,
    }));

    const topRequests = openRequests.slice(0, 3).map((request) => ({
      _id: request._id,
      type: request.type,
      location: request.location,
      urgency: request.urgency,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalShelters,
        openShelters,
        openRequests: openRequests.length,
        peopleSheltered,
        activeVolunteers,
        resolvedRequests: resolvedRequestsCount,
        assistedToday: assistedTodayCount,
        shelters: topShelters,
        requests: topRequests,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
