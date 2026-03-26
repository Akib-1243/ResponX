import express from 'express';
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js';
import { connectDB  } from "./config/db.js";
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('=== OAuth Debug ===');
console.log('Google ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Facebook ID exists:', !!process.env.FACEBOOK_CLIENT_ID);
console.log('GitHub ID exists:', !!process.env.GITHUB_CLIENT_ID);
console.log('==================');

import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import googleRoutes from './routes/google.js';
import facebookRoutes from './routes/facebook.js';
import githubRoutes from './routes/github.js';
import { configurePassport } from './config/passport.js';

const PORT=process.env.PORT || 5000;

const app=express();
configurePassport();

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static('d:/Mern Stack/ResponX/frontend'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/auth", facebookRoutes);
app.use("/api/auth", githubRoutes);

import resetDirectRoutes from './routes/reset-direct.js';
app.use("/api/auth", resetDirectRoutes);

// Removed missing testRoutes module import

// Root route - redirect to login page
app.get('/', (req, res) => {
    res.redirect('/login_register.html');
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);

});