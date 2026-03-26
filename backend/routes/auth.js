import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

//Register

router.post('/register' , async (req,res) =>{
    const{username, email, password, role} = req.body;

    try{
        if(!username || !email || !password){
            return res.status(400).json({message: "please fill all the fields"})

        }
        
        // Validate role
        const validRoles = ['victim', 'volunteer', 'trusted_volunteer', 'admin'];
        const userRole = role && validRoles.includes(role) ? role : 'victim';
        
        const user = await User.create({username,email,password, role: userRole});
        const token = generateToken(user._id);

        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token,


        });


    }catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({message: "Server error", error: err.message});

    }
});
//login

router.post('/login' , async (req, res) => {
    const{ email ,password } = req.body;

    try{
        if( !email || !password){
            return res.status(400).
            json({message: "please fill all the fields"})

        } 
        const user= await User.findOne({email});

        if(!user){
            console.log('User not found:', email);
            return res
            .status(401).
            json({message: "Invalid  credentials "});
        }
        
        const passwordMatch = await user.matchPassword(password);
        console.log('Password match:', passwordMatch);
        
        if(!passwordMatch){
            console.log('Password does not match for user:', email);
            return res
            .status(401).
            json({message: "Invalid  credentials "});

        }
        const token = generateToken(user._id);
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token,

        });

    } catch(err) {
        console.error("Login Error:", err);
        res.status(500).json({message: "Server error", error: err.message});
         
    }
})

// Forgot password (send reset link)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Avoid user enumeration: return the same response whether user exists or not.
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If that email exists, a reset link will be generated.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = sha256(resetToken);
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
        const resetUrl = `${frontendBaseUrl}/reset_password.html?token=${resetToken}`;

        const mode = process.env.FORGOT_PASSWORD_MODE || 'console';
        if (mode === 'console') {
            // In dev, we don't need SMTP; you can copy the reset link from server logs.
            console.log(`[forgot-password] Reset link: ${resetUrl}`);
            return res.status(200).json({ message: 'Reset link generated.', resetUrl });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Password reset',
            text: `Reset your password using this link: ${resetUrl}`,
            html: `<p>Reset your password using this link:</p><a href="${resetUrl}">${resetUrl}</a>`,
        });

        return res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reset password (token + new password)
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        const tokenHash = sha256(token);

        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const jwtToken = generateToken(user._id);
        return res.status(200).json({ message: 'Password updated', token: jwtToken });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Me
router.get("/me" ,protect, async (req,res) => {
    res.status(200).json(req.user);
})

export default router; 