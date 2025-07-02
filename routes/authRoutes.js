const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate Google OAuth flow
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback URL
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect accordingly.
    res.redirect('/listings'); // or any desired page
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {  // Depending on Passport version, this may be async
    res.redirect('/');
  });
});

module.exports = router;
