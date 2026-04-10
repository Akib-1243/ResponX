import VolunteerTask from '../models/VolunteerTask.js';

/* GET /api/tasks */
export const getAllTasks = async (req, res) => {
  try {
    const { assigned } = req.query;
    const filter = {};
    if (assigned !== undefined) filter.assigned = assigned === 'true';

    const tasks = await VolunteerTask.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/tasks  (admin only) */
export const createTask = async (req, res) => {
  try {
    const task = await VolunteerTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* PUT /api/tasks/:id/assign  (volunteer accepts/unassigns) */
export const toggleAssign = async (req, res) => {
  try {
    const task = await VolunteerTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.assigned   = !task.assigned;
    task.assignedTo = task.assigned ? req.user._id : null;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* DELETE /api/tasks/:id  (admin only) */
export const deleteTask = async (req, res) => {
  try {
    const task = await VolunteerTask.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
