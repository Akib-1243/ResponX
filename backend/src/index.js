import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

// Load environment variables
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('=== OAuth Debug ===');
console.log('Google ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Facebook ID exists:', !!process.env.FACEBOOK_CLIENT_ID);
console.log('GitHub ID exists:', !!process.env.GITHUB_CLIENT_ID);
console.log('==================');

// Import authentication routes
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/your-routes/google.js';
import facebookRoutes from './routes/your-routes/facebook.js';
import githubRoutes from './routes/your-routes/github.js';
import resetDirectRoutes from './routes/your-routes/reset-direct.js';
import { configurePassport } from './config/passport.js';

// Configure passport
configurePassport();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('d:/Mern Stack/ResponX/frontend'));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/auth", facebookRoutes);
app.use("/api/auth", githubRoutes);
app.use("/api/auth", resetDirectRoutes);

// Root route - redirect to login page
app.get('/', (req, res) => {
    res.redirect('/login_register.html');
});

// Database connection and server start
mongoose.connect('mongodb://localhost:27017/responx')
    .then(() => {
        console.log('MongoDB connected localhost');
        app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });