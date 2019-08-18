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
		next();
	}

	const org_name = req.query.name;
	const page = parseInt(req.query.page);
	let aux_pageSize = parseInt(req.query.pageSize);
	const pageSize = (aux_pageSize < 100 ? aux_pageSize : 100);

	let query = selectRelationships(org_name,pageSize, page);

	pool.query(query, (err, result) => {
		if (err) {
			res.status(500).send({ error: e.message });
			next();
		}
		res.send(result.rows);
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

			let unsorted_result = await transverseJSONTree(req.body, '');
			let result = unsorted_result.split(";");
			result.sort();
			result = result.join("\n;");
			
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

/**
 * Returns prepared statement to fetch all relations of a given organization
 * @param {string} org_name 
 * @param {string} pageSize for limit
 * @param {string} page for offset
 */
function selectRelationships(org_name, pageSize, page) {
	return `
	SELECT relationship_type, name as org_name FROM organizations org
	INNER JOIN
		(
			SELECT
            end_org as other_id,
			relationship_type as rel, CASE WHEN relationship_type = 'parent' THEN 'daughter' WHEN relationship_type = 'sister' THEN 'sister' ELSE '' END as relationship_type
            FROM relationships r JOIN organizations o ON r.start_org = o.id
            WHERE o.name = '${org_name}'
        UNION
        SELECT 
            start_org as other_id,
			relationship_type as rel, CASE WHEN relationship_type = 'parent' THEN 'parent' WHEN relationship_type = 'sister' THEN 'sister' ELSE '' END as relationship_type
            FROM relationships r JOIN organizations o ON r.end_org = o.id
            WHERE o.name = '${org_name}'
		) AS aux
	ON org.id = aux.other_id
	ORDER BY org.name ASC LIMIT ${pageSize} OFFSET ${page}
	`
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

	if (!script.includes(`${org_name}');`)) { //ensures no duplicate insertions of orgs
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
	return `INSERT INTO ORGANIZATIONS(NAME) VALUES('${name}');`
}

/**
 * Returns premade query to insert new relationship of type parent
 * @param {string} parentName 
 * @param {string} childName 
 * @returns {string} query
 */
function insertParentChildRelation(parentName, childName) {
	return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATIONSHIP_TYPE)
	 SELECT p.id, c.id, 'parent'
	 FROM(SELECT id FROM organizations WHERE name = '${parentName}') p
	, (SELECT id FROM organizations WHERE name = '${childName}') c;`
	//return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATIONSHIP_TYPE) VALUES('${parentName}', '${childName}', 'parent');`
}

/**
 * Returns premade query to insert new relationship of type sister
 * @param {string} daughter1
 * @param {string} daughter2
 * @returns {string} query
 */
function insertSiblingRelation(daughter1, daughter2) {
	return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATIONSHIP_TYPE)
	 SELECT p.id, e.id, 'sister'
	 FROM(SELECT id FROM organizations WHERE name = '${daughter1}') p
	, (SELECT id FROM organizations WHERE name = '${daughter2}') e;`
	//return `INSERT INTO RELATIONSHIPS(START_ORG, END_ORG, RELATIONSHIP_TYPE) VALUES('${daughter1}', '${daughter2}', 'sister');`
}


module.exports = {
	get_relations,
	create_all
}