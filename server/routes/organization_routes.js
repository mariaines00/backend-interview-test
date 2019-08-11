'use strict';

const express = require('express');
const router = express.Router();

const controller = require('../controllers/organization_controller');

/**
 *  Defines the routes and assigns controllers
 */


/**
 * 
 */
router.post('/', controller.create_all);


/**
 * 
 */
router.get('/:name', controller.get_relations);


module.exports = router;