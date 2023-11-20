const User = require('../../model/User');
const bcrypt = require('bcrypt');

const signupController = async (req, res) => {
	const { firstName, lastName, email, password } = req.body;
	console.log(req.body);
	if (!firstName || !lastName || !email || !password) {
		return res.sendStatus(400);
	}

	const hashPassword = await bcrypt.hash(password, 10);

	// check for existing user
	const userExist = await User.findOne({ email: email });
	if (userExist) {
		if (!userExist.password) {
			try {
				const resultUpd = await User.updateOne(
					{ email: email },
					{
						$set: { password: hashPassword },
					}
				);
				console.log(resultUpd);
				if (resultUpd.modifiedCount) {
					req.login(userExist, (err) => {
						if (err) return res.sendStatus(409);
						return res.status(200).redirect(`/main/d/${userExist.id}`);
					});
					return;
				} else {
					return res.sendStatus(400); // bad requests
				}
			} catch (error) {
				console.error(error);
				res.sendStatus(500);
			}
		} else {
			return res.status(406).send('user exist');
		}
	}
	try {
		const result = await User.create({
			email: email,
			password: hashPassword,
			displayName: `${firstName} ${lastName}`,
			firstName: firstName,
			lastName: lastName,
		});
		console.log(result);
		req.login(result, (err) => {
			//  establish a login session
			if (err) return res.sendStatus(409);
			return res.status(201).redirect(`/main/d/${result.id}`);
		});
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
};

module.exports = signupController;
