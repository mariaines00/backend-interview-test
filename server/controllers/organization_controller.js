'use strict';

const { pool } = require('../db/connection');


/* Implementation */

/**
 * Retrieve all relations of one organization (includes all parents, daughters and sisters of a given organization)
 * @param {*} req 
 * @param {*} res 
 */
const get_relations = function (req, res) {
    res.send('NOT IMPLEMENTED');
};


/**
 * All relations and organisations are inserted with one request
 * @param {*} req 
 * @param {*} res 
 */
const create_all = function (req, res) {
    res.send('NOT IMPLEMENTED');
};


module.exports = {
    get_relations,
    create_all
}