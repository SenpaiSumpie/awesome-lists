const express = require('express');
const app = express();

// -------------- ROUTES  -------------- //
const testRouter = require('./routes/test.cjs');

// -------------- ASSIGNING URLS -------------- //
app.use('/test', testRouter);

// -------------- TESTING DEFAULT URL -------------- //
app.get('/', (req, res) => {
	res.send('AWESOME LIST: Hello World!');
});

module.exports = app;
