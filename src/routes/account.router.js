'use strict';

const router = require('express').Router();
const config = require('nconf');
const _ = require('lodash');
const frisk =

//const Logger = require('src/util/logger.js').passwordRouter;
const Err = require('src/util/error.js');
const AuthService = require('src/services/auth.service.js');
const AccountsService = require('src/services/accounts.service.js');
const TokenService = require('src/services/token.service.js');

const PasswordsService = require('src/services/passwords.service.js');
const LoginMethodsService = require('src/services/loginMethods.service.js');

const EmailService = require('src/services/email.service.js');
const RequestValidator = require('src/util/request.validator.js');
const VerificationData = require('src/data/verification.data.js');

router.post('/',
    )




router.post('/create',
    // an access token can be specified in the Authorization header or directly in the body
    AuthService.middleware.loadAndVerifyToken,
    (req, res, next) => {
        if (req.tokenString) {
            req.body.token = req.tokenString;
        }
        next();
    },
    RequestValidator.validateFields([
        {
            name: 'email',
            type: 'string',
            required: true,
        },
        {
            name: 'password',
            type: 'string',
            required: true,
        },
        {
            name: 'name',
            type: 'string',
            required: false,
        },
        {
            name: 'token',
            type: 'string',
            required: true,
        },
    ]),
    PasswordsService.middleware.enforcePasswordStrength('password'),
    (req, res, next) => {
        EmailService.checkVerificationToken(req.body.email, req.body.token, 'create')
        // If token is valid, create the account
            .then(() => {
                return AccountsService.getOrCreateAccount(req.body);
            })
            // Add a password login method to the account
            .then((account) => {
                return PasswordsService.setPasswordForAccount(account, req.body.password)
                    .then((loginMethod) => {
                        return TokenService.generateAndPersistRefreshAndBearerTokens(account.externalId, {
                            accountId: account.id,
                            loginMethodId: loginMethod.id
                        });
                    })
                    .then((tokens) => {
                        return TokenService.generateTokenResponse(tokens);
                    })
                    .then((response) => {
                        res.status(200).send(response);
                    });
            })
            .catch(next);
    }
);

router.post('/auth',
    RequestValidator.validateFields([
        {
            name: 'email',
            type: 'string',
            required: true,
        },
        {
            name: 'password',
            type: 'string',
            required: true,
        },
    ]),
    (req, res, next) => {
        AccountsService.getAccountByEmail(req.body.email)
            .then((account) => {
                if (!account) {
                    throw new Err.password.badCredentials();
                }
                return PasswordsService.comparePasswordForAccount(account, req.body.password)
                    .then(([match, loginMethod]) => {
                        if (!match) {
                            throw new Err.password.badCredentials();
                        }
                        return TokenService.generateAndPersistRefreshAndBearerTokens(account.externalId, {
                            accountId: account.id,
                            loginMethodId: loginMethod.id
                        });
                    })
                    .catch((err) => {
                        // translate no-password error to bad-creds error
                        if (err.name === 'AccountHasNoPasswordError') {
                            throw new Err.password.badCredentials();
                        }
                        throw err;
                    });
            })
            .then((tokens) => {
                return TokenService.generateTokenResponse(tokens);
            })
            .then((response) => {
                res.status(200).send(response);
            })
            .catch(next);
    }
);

router.post('/change',
    AuthService.middleware.loadAndVerifyToken,
    AuthService.middleware.enforceBearerToken,
    RequestValidator.validateFields([
        {
            name: 'oldPassword',
            type: 'string',
            required: true
        },
        {
            name: 'newPassword',
            type: 'string',
            required: true
        },
    ]),
    PasswordsService.middleware.enforcePasswordStrength('newPassword'),
    (req, res, next) => {

        let account;
        const externalId = req.token.sub;

        // Get account record from the account's externalId
        AccountsService.getAccountByExternalId(externalId)
        // Verify that the oldPassword is correct
            .then((_account) => {
                if (!_account) {
                    throw new Err.password.badCredentials();
                }
                account = _account;
                return PasswordsService.comparePasswordForAccount(account, req.body.oldPassword);
            })
            // Revoke all the user's existing refresh tokens
            .then(([match]) => {
                if (!match) {
                    throw new Err.password.badCredentials();
                }
                return TokenService.revokeAllRefreshTokens(externalId);
            })
            // Change the account's password
            .then(() => {
                return PasswordsService.changePasswordForAccount(account, req.body.newPassword);
            })
            // Generate a new refresh/bearer token pair for immediate use
            .then((loginMethod) => {
                return TokenService.generateAndPersistRefreshAndBearerTokens(externalId, {
                    accountId: account.id,
                    loginMethodId: loginMethod.id,
                });
            })
            // Format refresh/bearer token pair into response format
            .then((tokens) => {
                return TokenService.generateTokenResponse(tokens);
            })
            .then((response) => {
                res.status(200).send(response);
            })
            .catch(next);
    }
);

router.post('/request_reset',
    RequestValidator.validateFields([
        {
            name: 'email',
            type: 'string',
            required: true,
        },
    ]),
    (req, res, next) => {
        // send the response right away
        res.status(200).send({
            message: 'Sending password reset email',
        });

        let account;
        let token;
        AccountsService.getAccountByEmail(req.body.email)
            .then((_account) => {
                if (!_account) {
                    // spoof an account
                    account = {
                        email: req.body.email,
                    };
                    // no login methods
                    return [];
                }
                account = _account;
                return LoginMethodsService.getLoginMethodsForAccountByScheme(account.dataValues.id);
            })
            // If user has a password, generate a password reset token
            .then((loginMethods) => {
                if (loginMethods.password) {
                    return TokenService.generatePasswordResetToken({
                        accountId: account.id,
                        loginMethodId: loginMethods.password.id,
                    });
                } else if (loginMethods.google_auth) {
                    return 'GoogleAuth';
                }
                return 'NoAccount';
            })
            /* Store token and email in cache. Even if the user doesn't have a password to
             * reset, this will be used to prevent abuse by sending multiple emails
             */
            .then((_token) => {
                token = _token;
                return VerificationData.getTokenRecord(req.body.email, 'reset');
            })
            .then((record) => {
                if (record) {
                    throw new Err.account.tooManyRequests();
                }
            })
            .then(() => {
                const tokenLifespan = config.get('tokenExpiries:passwordResetToken');
                return VerificationData.setTokenRecord(
                    req.body.email,
                    { token },
                    'reset',
                    tokenLifespan
                );
            })
            // Send an appropriate password reset email
            .then(() => {
                if (token === 'NoAccount') {
                    return EmailService.sendAccountNonexistantEmail(account);
                } else if (token === 'GoogleAuth') {
                    return EmailService.sendGoogleResetEmail(account);
                }
                return EmailService.sendPasswordResetEmail(account, token);
            })
            .catch((err) => {
                if (err.name !== 'TooManyRequestsError') {
                    Logger.error(err);
                }
            });
    }
);

router.post('/confirm_reset',
    AuthService.middleware.loadAndVerifyToken,
    AuthService.middleware.validatePasswordResetToken,
    RequestValidator.validateFields([
        {
            name: 'password',
            type: 'string',
            required: true,
        },
    ]),

    AccountsService.middleware.loadAccountFromToken,
    PasswordsService.middleware.enforcePasswordStrength('password'),
    (req, res, next) => {
        VerificationData.getTokenRecord(req.account.email, 'reset')
            .then((tokenRecord) => {
                const sentToken = req.headers.authorization.split(' ')[1];
                if (_.isNull(tokenRecord) || sentToken !== tokenRecord.token) {
                    throw new Err.token.expired();
                }
                if (tokenRecord.token === 'GoogleAuth' || tokenRecord.token === 'NoAccount') {
                    throw new Err.token.invalidContents();
                }
                return VerificationData.delTokenRecord(req.account.email, 'reset');
            })
            .then(() => {
                return PasswordsService.changePasswordForAccount(req.account, req.body.password);
            })
            .then((loginMethod) => {
                // Revoke all the existing refresh tokens
                return TokenService.revokeAllRefreshTokens(req.account.externalId)
                    .then(() => {
                        return TokenService.generateAndPersistRefreshAndBearerTokens(req.account.externalId, {
                            accountId: req.account.id,
                            loginMethodId: loginMethod.id
                        });
                    })
                    .then((tokens) => {
                        return TokenService.generateTokenResponse(tokens);
                    })
                    .then((response) => {
                        res.status(200).send(response);
                    });
            })
            .catch(next);
    }
);

module.exports = router;
