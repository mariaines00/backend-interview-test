const Pool = require('pg').Pool;

pool = new Pool({
	host: 'localhost', //database
	port: 5432,
	user: 'pipedrive',
	password: 'pipedrive',
	database: 'organizations',
})

module.exports = {
	pool
}