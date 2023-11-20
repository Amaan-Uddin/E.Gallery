module.exports = {
	userIsAuth: (req, res, next) => {
		if (req.isAuthenticated()) res.redirect(`/main/d/${req.user.id}`);
		else next();
	},
	userIsAuthorized: (req, res, next) => {
		if (!req.isAuthenticated()) res.redirect('/');
		else next();
	},
};
