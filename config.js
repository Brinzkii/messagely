/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const BCRYPT_WORK_FACTOR = 12;

function getTime() {
	const today = new Date();
	const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

	return date + ' ' + time;
}

module.exports = {
	SECRET_KEY,
	BCRYPT_WORK_FACTOR,
	getTime,
};
