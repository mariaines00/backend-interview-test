const Pool = require('pg').Pool;

const pool = new Pool({
	user: 'pipedrive',
	host: 'localhost',
	database: 'organizations',
	password: 'pipedrive',
	port: 5432,
});

module.exports = pool;