import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE ,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';


// ================= REGISTER =================
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Please fill all fields" });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send welcome email (safe)
        try {
            await transporter.sendMail({
                from: `"ResponX" <${process.env.SENDER_EMAIL}>`,
                to: email,
                subject: "Welcome to ResponX",
                text: `Hi ${name},\n\nWelcome to ResponX!`
            });
        } catch (err) {
            console.log("Email error:", err.message);
        }

        return res.json({ success: true, message: "Registration successful" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// ================= LOGIN =================
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Please fill all fields" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, message: "Login successful" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.json({ success: true, message: "Logout successful" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// ================= SEND VERIFY OTP =================
export const sendVerifyOtp = async (req, res) => {
    const userId = req.userId; 

    if (!userId) {
        return res.json({ success: false, message: "UserId required" });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) return res.json({ success: false, message: "User not found" });

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        try {
            await transporter.sendMail({
                from: `"ResponX" <${process.env.SENDER_EMAIL}>`,
                to: user.email,
                subject: "Verify your account",
                html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
            });
        } catch (err) {
            console.log("Email error:", err.message);
        }

        return res.json({ success: true, message: "OTP sent" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId;
 
    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing data" });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.verifyOtp || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Email verified" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// ================= AUTH CHECK =================
export const isAuthenticated = async (req, res) => {
    return res.json({ success: true, message: "Authenticated" });
};

// ================= SEND RESET OTP =================
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) return res.json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        try {
            await transporter.sendMail({
                from: `"ResponX" <${process.env.SENDER_EMAIL}>`,
                to: user.email,
                subject: "Password Reset OTP",
                //text: `Your OTP is: ${otp}`
                html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
             });
        } catch (err) {
            console.log("Email error:", err.message);
        }

        return res.json({ success: true, message: "Reset OTP sent" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "All fields required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};