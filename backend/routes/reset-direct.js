import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

router.post('/reset-password-direct', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password directly (bypass pre-save hook)
        await User.updateOne(
            { _id: user._id },
            { password: hashedPassword }
        );
        
        console.log('Password updated for user:', email);

        // Generate new token
        const token = generateToken(user._id);

        res.json({
            message: 'Password updated successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Direct password reset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
