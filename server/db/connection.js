const { Client } = require('pg');

client = new Client({
	host: 'localhost',
	port: 5432,
	user: 'pipedrive',
	password: 'pipedrive',
	database: 'organizations',
})

module.exports = {
	client
}