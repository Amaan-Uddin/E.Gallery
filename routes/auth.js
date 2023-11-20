const express = require('express');
const router = express.Router();
const passport = require('passport');

// @Controllers
const signupController = require('../controllers/auth/signupCon');

/**
 * @desc  Authenticate via Google
 * @route GET /auth/google
 */
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

/**
 * @desc  Callback invoked after authentication
 * @route GET /auth/google/callback
 */
router.get(
	'/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/',
		failureMessage: true,
	}),
	(req, res) => {
		res.redirect(`/main/d/${req.user.id}`);
	}
);

/**
 * @desc  Render Login page
 * @route GET /auth/log
 */
router.get('/log', (req, res) => {
	res.render('pages/loginPage');
});

/**
 * @desc  Render Signup page
 * @route GET /auth/sign
 */
router.get('/sign', (req, res) => {
	res.render('pages/signupPage');
});

/**
 * @desc  logs the user out and ends the session
 * @route GET /auth/logout
 */
router.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) {
			res.sendStatus(500);
		} else {
			res.redirect('/');
		}
	});
});

/**
 * @desc  Login user credentials
 * @route POST /auth/log
 */
router.post('/log');

/**
 * @desc  Signup user credentials
 * @route POST /auth/sign
 */
router.post('/sign', signupController);

module.exports = router;
