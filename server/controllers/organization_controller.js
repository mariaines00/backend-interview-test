'use strict';

const pool = require('../db/connection').pool;
/* Implementation */

/**
 * Retrieve all relations of one organization (includes all parents, daughters and sisters of a given organization)
 * @param {*} req 
 * @param {*} res 
 */
const get_relations = function (req, res) {

	if(!validateInputDataForGET(req.query, res)) {
		res.sendStatus(400);
		return;
	}

	const org_name = req.query.name;
	let aux_page = parseInt(req.query.page);
	const page = (aux_page === 0 ? 1 : aux_page);
	let aux_pageSize = parseInt(req.query.pageSize);
	const pageSize = (aux_pageSize < 100 ? aux_pageSize : 100);

	pool.query('SELECT * FROM relationships WHERE LOWER(start_org) = LOWER($1) OR LOWER(end_org) = LOWER($1)', [org_name], (err, res) => {
		if (err) {
			res.status(500).send({ error: e.message })
		}
		//parseData then res.send
	})
};


/**
 * All relations and organisations are inserted with one request
 * @param {*} req 
 * @param {*} res 
 */
const create_all = function (req, res) {
	(async () => {
		const client = await pool.connect();
		let error = false;
		try {
			await pool.query('BEGIN');
			let result = await transverseJSONTree(req.body, '');
			await pool.query(result);
			await pool.query('COMMIT');
		} catch (e) {
			console.log(e.message);
			await client.query('ROLLBACK');
			error = true;
		} finally {
			client.release();
			if(error) {
				res.sendStatus(500);
			} else {
				res.sendStatus(200);
			}
		}
	})().catch(e => res.status(500).send({ error: e.message }))		
};


/** AUXILIAR FUNCTIONS FOR GET (get_relations) **/

/**
 * Returns true if the req.query is valid
 * 	false otherwise
 * Could be used in a middleware tbh
 * @param {*} requestQuery 
 */
function validateInputDataForGET(requestQuery) {
	let isvalid = true;

	if (!Object.keys(requestQuery).length) {
		isvalid = false;
	}
	if (!requestQuery.hasOwnProperty('name')) {
		console.log('two');
		isvalid = false;
	}
	if (!(requestQuery.hasOwnProperty('page') && !isNaN(parseInt(requestQuery.page)))) {
		isvalid = false;
	}
	if (!(requestQuery.hasOwnProperty('pageSize') && !isNaN(parseInt(requestQuery.pageSize)))) {
		isvalid = false;
	}

	return isvalid;
} 


/** AUXILIAR FUNCTIONS FOR POST (create_all) **/

/**
 * Visits each node of the input tree data and adds them to the database
 * //TODO: error handling and pool object ref handling
 * @param {*} pool 
 * @param {*} organization 
 */
async function transverseJSONTree(organization, script) {

	validateInputDataForPOST(organization);

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
 * as oposed of iterating thru the whole tree in one sitting
 * would need and actual perf test to determine which approach would be ´
 * better in case of LARGE data sets
 * 
 * @param {Object} organization current node being validated
 */
function validateInputDataForPOST(organization) {
	if(!(organization && typeof(organization)==='object')) {
		throw new Error('input data is not correct');
	}
	if(!organization['org_name']) {
		throw new Error('input data is not correct');
	}
}

/**
 * Returns premade query to insert new organization
 * @param {string} name 
 * @returns {string} query
 */
function insertOrganization(name) {
	return `INSERT INTO ORGANIZATIONS(NAME) VALUES('${name}'); \n`
}

/**
 * Returns premade query to insert new relationship of type parent
 * @param {string} parentName 
 * @param {string} childName 
 * @returns {string} query
 */
function insertParentChildRelation(parentName, childName) {
	return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATION_TYPE) VALUES('${parentName}', '${childName}', 'parent'); \n`
}

/**
 * Returns premade query to insert new relationship of type sister
 * @param {string} parentName 
 * @param {string} childName 
 * @returns {string} query
 */
function insertSiblingRelation(daughter1, daughter2) {
	return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATION_TYPE) VALUES('${daughter1}', '${daughter2}', 'sister'); \n`
}


module.exports = {
	get_relations,
	create_all
}