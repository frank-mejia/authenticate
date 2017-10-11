'use strict';

const _      = require('lodash');
const config = require('nconf');

const Err = require('egads').extend('Unexpected error occured', 500, 'InternalServerError');

Err.password                    = Err.extend('Password authentication error', 401, 'AuthenticationError');
Err.passwordStrength            = Err.extend('Password is too weak', 400, 'PasswordTooWeakError');

Err.token                       = Err.extend('Invalid authentication token', 401, 'InvalidTokenError');

Err.account                     = Err.extend('Account error', 500, 'AccountError');
Err.account.invalidCredentials  = Err.account.extend('Invalid credentials', 422, 'InvalidCredentialsError');
Err.account.alreadyExists       = Err.account.extend('Account already exists', 409, 'AccountAlreadyExistsError');

// handlers
Err.expressHandler = (err, req, res, next) => {
    if (!err) return next();

    // something was already sent; nothing to do
    if (res.headersSent) {
        console.log(`Error handler was triggered after res headers were sent. Error: ${err}`);
        return;
    }
    if (err instanceof Error && err.name === 'SyntaxError') {
        return res.status(400).send({ message: 'Invalid JSON body' });
    }
    if (err instanceof Error && err.message === 'request entity too large') {
        return res.status(413).send({ message: 'Request body too long' });
    }
    if (err instanceof Err) {
        return res.status(err.status).send(_.assign({}, {
            name:    err.name,
            message: err.message,
        }, err.fields));
    }

    if (err.response) {
        return res.status(err.status).send({
            name:    err.name,
            message: err.response.text,
        });
    }

    if (config.get('NODE_ENV') !== 'production') {
        return res.status(500).send({
            message: err.message,
            stack:   err.stack
        });
    }
    res.status(500).send({ message: 'Unexpected Error.' });
};

Err.catchAll404 = (req, res, next) => {
    if (!res.headersSent) {
        res.status(404).send({
            message:  'The requested resource does not exist.',
            resource: `${req.method} ${req.path}`,
        });
    }
};

module.exports = Err;
