import express from 'express';
import passport from 'passport';
import { generateToken } from '../../utils/generateToken.js';

const router = express.Router();

router.get('/facebook', (req, res, next) => {
    const hasFacebookOAuth =
        Boolean(process.env.FACEBOOK_CLIENT_ID) && Boolean(process.env.FACEBOOK_CLIENT_SECRET);
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
    if (!hasFacebookOAuth) return res.redirect(`${frontendBaseUrl}/login_register.html?error=facebook_not_configured`);
    next();
}, passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    (req, res, next) => {
        const hasFacebookOAuth =
            Boolean(process.env.FACEBOOK_CLIENT_ID) && Boolean(process.env.FACEBOOK_CLIENT_SECRET);
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
        if (!hasFacebookOAuth) return res.redirect(`${frontendBaseUrl}/login_register.html?error=facebook_not_configured`);
        next();
    },
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500'}/login_register.html?error=facebook`,
    }),
    async (req, res) => {
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
        const user = req.user;

        if (!user) {
            return res.redirect(`${frontendBaseUrl}/login_register.html?error=facebook_no_user`);
        }

        const token = generateToken(user._id);
        const tokenLiteral = JSON.stringify(token);

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

