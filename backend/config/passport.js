import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import crypto from 'crypto';
import User from '../models/User.js';

export const configurePassport = () => {
    const hasGoogleOAuth =
        Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

    if (hasGoogleOAuth) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const googleId = profile.id;
                        const email = profile.emails?.[0]?.value;
                        const displayName = profile.displayName || 'google_user';

                        if (!email) {
                            return done(new Error('Google account email is missing.'));
                        }

                        let user = await User.findOne({ email });
                        if (!user) {
                            user = await User.create({
                                username: displayName,
                                email,
                                password: crypto.randomBytes(16).toString('hex'),
                                googleId,
                            });
                        } else if (!user.googleId) {
                            user.googleId = googleId;
                            await user.save();
                        }

                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    } else {
        console.warn('[passport] Google OAuth not configured (missing GOOGLE_CLIENT_ID/SECRET).');
    }

    const hasFacebookOAuth =
        Boolean(process.env.FACEBOOK_CLIENT_ID) && Boolean(process.env.FACEBOOK_CLIENT_SECRET);

    if (hasFacebookOAuth) {
        passport.use(
            new FacebookStrategy(
                {
                    clientID: process.env.FACEBOOK_CLIENT_ID,
                    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
                    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
                    profileFields: ['id', 'emails', 'name'],
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const facebookId = profile.id;
                        const email = profile.emails?.[0]?.value;
                        const displayName = profile.displayName || 'facebook_user';

                        if (!email) {
                            return done(new Error('Facebook account email is missing.'));
                        }

                        let user = await User.findOne({ email });
                        if (!user) {
                            user = await User.create({
                                username: displayName,
                                email,
                                password: crypto.randomBytes(16).toString('hex'),
                                facebookId,
                            });
                        } else if (!user.facebookId) {
                            user.facebookId = facebookId;
                            await user.save();
                        }

                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    } else {
        console.warn('[passport] Facebook OAuth not configured (missing FACEBOOK_CLIENT_ID/SECRET).');
    }

    const hasGitHubOAuth =
        Boolean(process.env.GITHUB_CLIENT_ID) && Boolean(process.env.GITHUB_CLIENT_SECRET);

    if (hasGitHubOAuth) {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: process.env.GITHUB_CLIENT_ID,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET,
                    callbackURL: process.env.GITHUB_CALLBACK_URL,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const githubId = profile.id;
                        const email =
                            profile.emails?.[0]?.value || profile._json?.email || profile._json?.primary_email;
                        const displayName = profile.username || 'github_user';

                        if (!email) {
                            return done(new Error('GitHub account email is missing. Ensure you authorize email scope.'));
                        }

                        let user = await User.findOne({ email });
                        if (!user) {
                            user = await User.create({
                                username: displayName,
                                email,
                                password: crypto.randomBytes(16).toString('hex'),
                                githubId,
                            });
                        } else if (!user.githubId) {
                            user.githubId = githubId;
                            await user.save();
                        }

                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    } else {
        console.warn('[passport] GitHub OAuth not configured (missing GITHUB_CLIENT_ID/SECRET).');
    }

    
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).select('-password');
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};

