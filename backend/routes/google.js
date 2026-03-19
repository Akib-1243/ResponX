import express from 'express';
import passport from 'passport';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

router.get(
    '/google',
    (req, res, next) => {
        const hasGoogleOAuth =
            Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
        if (!hasGoogleOAuth) {
            const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
            return res.redirect(`${frontendBaseUrl}/login_register.html?error=google_not_configured`);
        }
        next();
    },
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
    })
);

router.get(
    '/google/callback',
    (req, res, next) => {
        const hasGoogleOAuth =
            Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
        if (!hasGoogleOAuth) {
            const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
            return res.redirect(`${frontendBaseUrl}/login_register.html?error=google_not_configured`);
        }
        next();
    },
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500'}/login_register.html?error=google`,
    }),
    async (req, res) => {
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
        const user = req.user;

        if (!user) {
            return res.redirect(`${frontendBaseUrl}/login_register.html?error=google_no_user`);
        }

        const token = generateToken(user._id);
        const tokenLiteral = JSON.stringify(token);

        // Set JWT token for the existing frontend code, then redirect back to login page.
        return res.send(`<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      localStorage.setItem('token', ${tokenLiteral});
      window.location.href = '${frontendBaseUrl}/index.html';
    </script>
  </body>
</html>`);
    }
);

export default router;

