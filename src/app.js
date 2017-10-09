'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const routes     = require('./routes/routes.js');

const Err        = require('./util/error');

const app = express();

// CORS: allow web requests from any domain
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Headers',
    'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
if (req.method === 'OPTIONS') {
    return res.status(200).send();
}
next();
});

app.enable('trust proxy');
app.disable('x-powered-by');

app.use(bodyParser.json({
    limit: '10KB',
}));
app.use('/v1', routes);

app.use(Err.expressHandler);
app.use(Err.catchAll404);

module.exports = app;
