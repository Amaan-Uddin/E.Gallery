const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/User');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(async function (email, password, done) {
			try {
				const user = await User.findOne({ email: email });
				if (!user) return done(null, false, { message: 'User not found' });

				bcrypt.compare(password, user.password, (err, res) => {
					if (res) return done(null, user);
					else return done(null, false, { message: 'Incorrect Password' });
				});
			} catch (error) {
				console.error(error);
			}
		})
	);

	passport.serializeUser(function (user, cb) {
		process.nextTick(function () {
			return cb(null, {
				id: user.id,
				username: user.displayName,
				email: user.email,
			});
		});
	});

	passport.deserializeUser(function (user, cb) {
		process.nextTick(function () {
			return cb(null, user);
		});
	});
};
