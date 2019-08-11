'use strict';

const express = require('express');
const routes = require('./routes/organization_routes');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(errorHandler);

//request handling chain
app.use('/organizations', routes);


function logger() {
    
}

/**
 * Display the error stack in the console
 * Send something back to browser
 */
function errorHandler(err, req, res, next) {
    console.error(err.stack);

    res.status(err.status || 500);
    res.render(err.message);
}

// Initialize server
app.listen(port, () => { console.log(`server listening on port ${port}`); });