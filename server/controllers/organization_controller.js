'use strict';

const client = require('../db/connection').client;
/* Implementation */

/**
 * Retrieve all relations of one organization (includes all parents, daughters and sisters of a given organization)
 * @param {*} req 
 * @param {*} res 
 */
const get_relations = function (req, res) {
	client.connect();
	// client
	//     .query('SELECT NOW()')
	//     .then(result => res.send(result))
	//     .catch(e => res.send(e.stack))
	//     .then(() => client.end())
};


/**
 * All relations and organisations are inserted with one request
 * @param {*} req 
 * @param {*} res 
 */
const create_all = function (req, res) {
	client
		.connect()
		.then(() => {
			transverseJSONTree(client, req.body);
		})
		.catch(e => { throw new Error(e.stack) }) //TODO:
		.then(() => { 
			client.end(); 
			res.send();
		})
};

function transverseJSONTree(client, organization) {
	console.log(organization['org_name']);
	
	if (organization) {
		if (organization['daughters']) {
			for (let daughter of organization['daughters']) {
				transverseJSONTree(client, daughter);
			}
		}
	} else {
		return;
	}

}	

	// client.query(
	// 	'INSERT INTO users(name, email) VALUES($1, $2)',
	// 	['brianc', 'brian.m.carlson@gmail.com']
	// );
	// client.query(
	// 	'INSERT INTO users(name, email) VALUES($1, $2)',
	// 	['brianc', 'brian.m.carlson@gmail.com']
	// );
	//
	

module.exports = {
	get_relations,
	create_all
}