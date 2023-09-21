const express = require('express');
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const User = require('../models/user');
const db = require('../db');
const { SECRET_KEY } = require('../config');

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) throw new ExpressError('Username and password required', 400);

		const result = await User.authenticate(username, password);
		if (!result) {
			throw new ExpressError('Incorrect username/password', 400);
		} else {
			let token = jwt.sign({ username }, SECRET_KEY, { expiresIn: 60 * 120 });
			return res.json({ token });
		}
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
	try {
		const { username, password, first_name, last_name, phone } = req.body;
		if (!username || !password || !first_name || !last_name || !phone)
			throw new ExpressError(
				'Username, password, first & last name and phone required to register new user',
				400
			);

		let user = { username, password, first_name, last_name, phone };
		user = await User.register(user);
		await User.authenticate(user.username, password);
		let token = jwt.sign({ username }, SECRET_KEY, { expiresIn: 60 * 120 });
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
