const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../model/User');

module.exports = function (passport) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: 'http://localhost:4000/auth/google/callback',
				passReqToCallback: true,
			},
			async function (request, accessToken, refreshToken, profile, done) {
				console.log(profile);
				const userDetails = {
					email: profile.email,
					googleId: profile.id,
					displayName: profile.displayName,
					firstName: profile.given_name,
					lastName: profile.family_name,
					profilePic: profile.picture,
				};

				try {
					let user = await User.findOne({ googleId: profile.id });
					if (user) {
						done(null, user);
					} else {
						user = await User.create(userDetails);
						done(null, user);
					}
				} catch (error) {
					console.error(error);
				}
			}
		)
	);
	passport.serializeUser(function (user, cb) {
		process.nextTick(function () {
			return cb(null, {
				id: user.id,
				username: user.displayName,
				email: user.email,
				picture: user.picture,
			});
		});
	});

	passport.deserializeUser(function (user, cb) {
		process.nextTick(function () {
			return cb(null, user);
		});
	});
};
