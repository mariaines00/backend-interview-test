'use strict';

const express = require('express');
const router = express.Router();

const controller = require('../controllers/organization_controller');

/**
 *  Defines the routes and assigns controllers
 */


/**
 * Endpoint 1 
 *  Adds the organizations with relations to the database.
 *  One organization may have multiple parents and daughters.
 *  Organization name is unique.
 */
router.post('/', controller.create_all);


/**
 * Endpoint 2
 *  Retrieve all relations of one organization (parents, daughters and sisters).
 *  Queried by name.
 *  List is ordered by name and one page may return 100 rows at max with pagination support.
 */
router.get('/', controller.get_relations);


module.exports = router;