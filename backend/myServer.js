import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import dns from 'dns';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import aidRequestRouter from './routes/aidRequestRoutes.js';
import shelterRouter from './routes/shelterRoutes.js';
import volunteerRouter from './routes/volunteerRoutes.js';
import photoRouter from './routes/photoRoutes.js';

// Change DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'];

const startServer = async () => {
    try {
        await connectDB();

        // Middlewares 
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ limit: '50mb', extended: true }));
        app.use(cookieParser());
        app.use(cors({ origin: allowedOrigins, credentials: true }));

        // Routes
        app.get("/", (req, res) => res.send("API Working"));
        app.use("/api/auth", authRouter);
        app.use("/api/user", userRouter); // existing user data route
        app.use("/api/requests", aidRequestRouter);
        app.use("/api/shelters", shelterRouter);
        app.use("/api/tasks", volunteerRouter);
        app.use("/api/photos", photoRouter);

        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
