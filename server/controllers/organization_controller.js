'use strict';

const client = require('../db/connection').client;
/* Implementation */

/**
 * Retrieve all relations of one organization (includes all parents, daughters and sisters of a given organization)
 * @param {*} req 
 * @param {*} res 
 */
const get_relations = function (req, res) {
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
				let result = await transverseJSONTree(req.body, '');
				client.query(result);
				client.end();
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
async function transverseJSONTree(organization, script) {

	validateInputData(organization);
	const org_name = organization['org_name'];

	if (!script.includes(`${org_name}')`)) { //ensures no duplicate insertions of orgs
		script += insertOrganization(org_name);
	}

	const daughters = organization['daughters'];
	if(daughters)  {
		for (let index = 0, length = daughters.length; index < length; index++) {
			if (index + 1 < length) {
				script += insertSiblingRelation(daughters[index]['org_name'], daughters[index + 1]['org_name']);
			}
			script += insertParentChildRelation(org_name, daughters[index]['org_name']); //TODO: daughter must be validated first
			script = await transverseJSONTree(daughters[index], script);
		}
	}

	return script;
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
function insertOrganization(name) {
	return `INSERT INTO ORGANIZATIONS(NAME) VALUES('${name}'); \n`
}

/**
 * 
 * @param {*} client 
 * @param {string} parentName 
 * @param {string} childName 
 */
function insertParentChildRelation(parentName, childName) {
	return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATION_TYPE) VALUES('${parentName}', '${childName}', 'parent'); \n`
}

/**
 * 
 * @param {*} client 
 * @param {string} parentName 
 * @param {string} childName 
 */
function insertSiblingRelation(daughter1, daughter2) {
	return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATION_TYPE) VALUES('${daughter1}', '${daughter2}', 'sisters'); \n`
}


module.exports = {
	get_relations,
	create_all
}