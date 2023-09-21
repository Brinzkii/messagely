/** Database connection for messagely. */

const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const DB_URI = process.env.NODE_ENV === 'test' ? 'messagely_test' : 'messagely';
const { USER, HOST, PASSWORD, PORT } = process.env;

let db = new Client({
	user: USER,
	host: HOST,
	database: DB_URI,
	password: PASSWORD,
	port: PORT,
});

db.connect();

module.exports = db;
