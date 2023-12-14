const express = require('express');

const app = express();
app.use(express.json());

// -------------- ROUTES  -------------- //
const testRouter = require('./routes/test.cjs');
const aiRouter = require('./routes/ai.cjs');

// -------------- ASSIGNING URLS -------------- //
app.use('/test', testRouter);
app.use('/ai', aiRouter);

// -------------- TESTING DEFAULT URL -------------- //
app.get('/', (req, res) => {
    res.send('AWESOME LIST: Hello World!');
});



module.exports = app;
