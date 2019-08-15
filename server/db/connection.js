const { Client } = require('pg');

function DatabaseClient() {

	return client = new Client({
		host: 'localhost',
		port: 5432,
		user: 'pipedrive',
		password: 'pipedrive',
		database: 'organizations',
	})

}

module.exports = new DatabaseClient();