'use strict';

const _      = require('lodash');
const logger = require('loglevel');
const config = require('nconf');

const Err = require('egads').extend('Unexpected error occured', 500, 'InternalServerError');

// errors
Err.request                     = Err.extend('Bad request error', 400, 'BadRequestError');
Err.request.invalidFields       = Err.request.extend('Missing or invalid field(s)', 400, 'InvalidFieldsRequestError');
Err.request.invalidEmail        = Err.request.extend('Email is missing/invalid', 400, 'InvalidEmailError');

Err.googleAuth                  = Err.extend('Google auth failed', 422, 'GoogleAuthError');
Err.googleAuth.invalidToken     = Err.googleAuth.extend('Invalid `googleIdToken`', 422, 'GoogleAuthTokenError');

Err.password                    = Err.extend('Password authentication error', 401, 'AuthenticationError');
Err.password.badCredentials     = Err.extend('Invalid account credentials', 401, 'BadCredentialsAuthError');

Err.passwordStrength            = Err.extend('Password is too weak', 400, 'PasswordTooWeakError');
Err.passwordStrength.tooShort   = Err.passwordStrength.extend(
    `Password must be at least ${config.get('passwords:minimumLength')} characters long`,
    400, 'PasswordTooShortError'
);
Err.passwordStrength.tooLong    = Err.passwordStrength.extend(
    `Password must be at most ${config.get('passwords:maximumLength')} characters long`,
    400, 'PasswordTooLongError'
);

Err.token                       = Err.extend('Invalid authentication token', 401, 'InvalidTokenError');
Err.token.required              = Err.extend('Authentication token required', 401, 'RequiredTokenError');

Err.token.invalidContents       = Err.token.extend('Invalid token contents', 401, 'InvalidContentsTokenError');
Err.token.expired               = Err.token.extend('Token is invalid or has expired', 403, 'ExpiredTokenError');
Err.token.invalidRefreshToken   = Err.token.extend('Invalid or Expired Refresh Token', 401, 'AuthenticationError');

Err.account                     = Err.extend('Account error', 500, 'AccountError');
Err.account.doesNotExist        = Err.account.extend('Account does not exist', 422, 'AccountDoesNotExistError');
Err.account.alreadyExists       = Err.account.extend('Account already exists', 409, 'AccountAlreadyExistsError');
Err.account.hasNoPassword       = Err.account.extend('Account has no password', 422, 'AccountHasNoPasswordError');
Err.account.tooManyRequests     = Err.account.extend('Too many requests sent', 422, 'TooManyRequestsError');
Err.account.hasPassword         = Err.account.extend('Account already has a password', 422, 'AccountHasPasswordError');
Err.account.hasLoginMethod      = Err.account.extend('Account already has login method', 422, 'AccountHasLoginMethod');
Err.account.wrongPassword       = Err.account.extend('Provided password is incorrect', 400, 'WrongAccountPasswordError');

Err.rest                        = Err.extend('REST error', 500, 'RESTError');
Err.rest.recordDoesNotExist     = Err.rest.extend('Record does not exist', 404, 'RESTRecordDoesNotExist');


// handlers
Err.expressHandler = (err, req, res, next) => {
    if (!err) return next();

    // something was already sent; nothing to do
    if (res.headersSent) {
        logger.warn(`Error handler was triggered after res headers were sent. Error: ${err}`);
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

    //Check for a superagent error
    if (err.response) {
        return res.status(err.status).send({
            name:    err.name,
            message: err.response.text,
        });
    }

    logger.error('Unexpected error:', err.stack || err);
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
