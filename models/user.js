/** User class for message.ly */

const db = require('../db');
const bcrypt = require('bcrypt');
const { SECRET_KEY, BCRYPT_WORK_FACTOR, getTime } = require('../config');
const ExpressError = require('../expressError');

/** User of the site. */

class User {
	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({ username, password, first_name, last_name, phone }) {
		const time = getTime();
		const hashPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const result = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, phone, join_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING username, password, first_name, last_name, phone`,
			[username, hashPwd, first_name, last_name, phone, time]
		);

		if (result.rowCount === 0) throw new ExpressError('Error occurred while registering, please try again', 400);

		return result.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const result = await db.query(
			`
		SELECT password FROM users WHERE username = $1`,
			[username]
		);
		const user = result.rows[0];

		if (user) {
			if ((await bcrypt.compare(password, user.password)) === true) {
				await User.updateLoginTimestamp(username);
				return true;
			}
		}
		return false;
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		const time = getTime();
		const result = await db.query(
			`UPDATE users
		SET last_login_at = $1 WHERE username = $2
		RETURNING username`,
			[time, username]
		);
		const user = result.rows[0];

		if (!user) throw new ExpressError('Incorrect username', 400);
	}

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);

		return results.rows;
	}

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {
		const result = await db.query(
			`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
			[username]
		);
		const user = result.rows[0];

		if (!user) throw new ExpressError('Incorrect username', 400);

		return user;
	}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		const results = await db.query(
			`SELECT id, to_username, body, sent_at, read_at FROM messages WHERE from_username = $1`,
			[username]
		);
		let msgs = results.rows;

		for (let m of msgs) {
			let u = m.to_username;
			delete m.to_username;
			const result = await User.get(u);
			m.to_user = {
				username: result.username,
				first_name: result.first_name,
				last_name: result.last_name,
				phone: result.phone,
			};
		}
		return msgs;
	}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		const results = await db.query(
			`SELECT id, from_username, body, sent_at, read_at FROM messages WHERE to_username = $1`,
			[username]
		);
		let msgs = results.rows;

		for (let m of msgs) {
			let u = m.from_username;
			delete m.from_username;
			const result = await User.get(u);
			m.from_user = {
				username: result.username,
				first_name: result.first_name,
				last_name: result.last_name,
				phone: result.phone,
			};
		}

		return msgs;
	}
}

module.exports = User;
