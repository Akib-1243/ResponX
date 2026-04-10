import bcrypt from 'bcryptjs';
import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, 'name email role status isAccountVerified createdAt').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'verified',
      isAccountVerified: true,
    });

    return res.status(201).json({ success: true, message: 'Admin user created successfully.', user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};