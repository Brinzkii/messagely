const express = require('express');
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const Message = require('../models/message');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const db = require('../db');
const { SECRET_KEY } = require('../config');

const router = new express.Router();

/** POST /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.post('/:id', ensureLoggedIn, async (req, res, next) => {
	try {
		const { id } = req.params;
		const msg = await Message.get(id);

		if (msg.from_user.username !== req.user.username && msg.to_user.username !== req.user.username)
			throw new ExpressError('Must be sender or recipient to view!', 401);

		return res.json({ message: msg });
	} catch (err) {
		return next(err);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
	try {
		const { to_username, body } = req.body;
		const msg = await Message.create({
			from_username: req.user.username,
			to_username,
			body,
		});
		return res.json({ message: msg });
	} catch (err) {
		return next(err);
	}
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
	try {
		const { id } = req.params;
		const msg = await Message.get(id);

		if (msg.to_user.username !== req.user.username) {
			throw new ExpressError('Only the intended recipient can mark a message read!', 401);
		} else {
			const result = await Message.markRead(id);
			return res.json({ message: result });
		}
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
