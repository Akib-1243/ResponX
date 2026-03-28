import express from 'express';
import passport from 'passport';
import { generateToken } from '../../utils/generateToken.js';

const router = express.Router();

router.get('/github', (req, res, next) => {
    const hasGitHubOAuth =
        Boolean(process.env.GITHUB_CLIENT_ID) && Boolean(process.env.GITHUB_CLIENT_SECRET);
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
    if (!hasGitHubOAuth) return res.redirect(`${frontendBaseUrl}/login_register.html?error=github_not_configured`);
    next();
}, passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    (req, res, next) => {
        const hasGitHubOAuth =
            Boolean(process.env.GITHUB_CLIENT_ID) && Boolean(process.env.GITHUB_CLIENT_SECRET);
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
        if (!hasGitHubOAuth) return res.redirect(`${frontendBaseUrl}/login_register.html?error=github_not_configured`);
        next();
    },
    passport.authenticate('github', {
        failureRedirect: `${process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500'}/login_register.html?error=github`,
    }),
    async (req, res) => {
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
        const user = req.user;

        if (!user) {
            return res.redirect(`${frontendBaseUrl}/login_register.html?error=github_no_user`);
        }

        const token = generateToken(user._id);
        const tokenLiteral = JSON.stringify(token);

        return res.send(`<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      localStorage.setItem('token', ${tokenLiteral});
      window.location.href = '${frontendBaseUrl}/src/index.html';
    </script>
  </body>
</html>`);
    }
);

export default router;

