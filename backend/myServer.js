import express from "express";  
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import dns from 'dns';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

// Change DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 4000;

// DB
connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'];

// Middlewares 
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins ,credentials: true }));

// Routes
app.get("/", (req, res) => res.send("API Working"));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter); // ✅ ADD THIS

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
// Trigger reboot
// Wake up nodemon