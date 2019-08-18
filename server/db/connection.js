const Pool = require('pg').Pool;

pool = new Pool({
	host: 'database', //localhost
	port: 5432,
	user: 'pipedrive',
	password: 'pipedrive',
	database: 'organizations',
})

module.exports = {
	pool
}