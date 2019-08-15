'use strict';

const client = require('../db/connection');
/* Implementation */

/**
 * Retrieve all relations of one organization (includes all parents, daughters and sisters of a given organization)
 * @param {*} req 
 * @param {*} res 
 */
const get_relations = function (req, res) {
    // client.connect();
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
    
};


//


module.exports = {
    get_relations,
    create_all
}