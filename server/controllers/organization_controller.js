'use strict';

const client = require('../db/connection').client;
/* Implementation */

/**
 * Retrieve all relations of one organization (includes all parents, daughters and sisters of a given organization)
 * @param {*} req 
 * @param {*} res 
 */
const get_relations = function (req, res) {
	client.connect()
	client
		.query(`select * from organizations`)
		.then(result => console.log(result))
		.catch(e => console.error(e.stack))
		.then(() => client.end())
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
			(async () => {
				await transverseJSONTree(client, req.body);
			})()
		})
		.catch(e => res.status(500).send({ error: e.message }) )
		.then(() => {
			//client.end();
		})
};


/**
 * Visits each node of the input tree data and adds them to the database
 * //TODO: error handling and client object ref handling
 * @param {*} client 
 * @param {*} organization 
 */
async function transverseJSONTree(client, organization) {

	validateInputData(organization);
	let org_name = organization['org_name'];
	console.log(org_name);

	insertOrganization(client, org_name);
	
	if (organization['daughters']) {
		for (let daughter of organization['daughters']) {
			insertParentChildRelation(client, org_name, daughter['org_name']); //TODO: daughter must be validated first
			transverseJSONTree(client, daughter);
		}
	}

}

/**
 * Evaluates whether each node of the input tree data is valid
 * @param {*} organization 
 */
function validateInputData(organization) {
	if(!(organization && typeof(organization)==='object')) {
		throw new Error('input data is not correct');
	}
	if(!organization['org_name']) {
		throw new Error('input data is not correct');
	}
}

/**
 * 
 * @param {Client} client 
 * @param {string} name 
 */
function insertOrganization(client, name) {
	client.query(
		'INSERT INTO ORGANIZATIONS(NAME) VALUES($1)',
		[name]
	);
}

/**
 * 
 * @param {*} client 
 * @param {string} parentName 
 * @param {string} childName 
 */
function insertParentChildRelation(client, parentName, childName) {
	client.query(
		'INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATION_TYPE) VALUES($1, $2, $3)',
		[parentName, childName, 'parent']
	);
}


module.exports = {
	get_relations,
	create_all
}