const express = require('express');
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const db = require('../db');
const { SECRET_KEY } = require('../config');

const router = new express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async (req, res, next) => {
	try {
		const users = await User.all();
		return res.json({ users: users });
	} catch (err) {
		return next(err);
	}
});

/** POST /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.post('/:username', ensureCorrectUser, async (req, res, next) => {
	try {
		console.log(req.headers);
		const { username } = req.params;
		const user = await User.get(username);
		return res.json({ user: user });
	} catch (err) {
		return next(err);
	}
});

/** POST /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.post('/:username/to', ensureCorrectUser, async (req, res, next) => {
	try {
		const { username } = req.params;
		const msgs = await User.messagesTo(username);
		return res.json({ messages: msgs });
	} catch (err) {
		return next(err);
	}
});

/** POST /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.post('/:username/from', ensureCorrectUser, async (req, res, next) => {
	try {
		const { username } = req.params;
		const msgs = await User.messagesFrom(username);
		return res.json({ messages: msgs });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
