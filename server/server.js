'use strict';

const express = require('express');
const routes = require('./routes/organization_routes');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//request handling chain
app.use(routesLogger);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.use('/organizations', routes);

function routesLogger(err, req, res, next) {
    console.log(`${req.method} ${req.baseUrl}`);
    next(req);
}

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Ups something went wrong :(' });
    } else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    res.status(500);
    //res.render('error', { error: err });
}

// Initialize server
app.listen(port, () => { console.log(`server listening on port ${port}`); });