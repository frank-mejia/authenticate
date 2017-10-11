'use strict';

const router = require('express').Router();
const arbitrate = require('express-arbitrate');

const AccountService = require('src/services/account.service.js');
const TokenService = require('src/services/token.service.js');

const PasswordService = require('src/services/password.service.js');
const EmailService = require('src/services/email.service.js');

router.post('/',
    arbitrate.validateRequest({
        name: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body
        },
        email: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body

        },
        password: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body
        }
    }),
    PasswordService.middleware.enforcePasswordStrength,
    EmailService.middleware.enforceValidEmail,
    (req, res, next) => {
        const accountInformation = req.body;
        return AccountService.createAccount(accountInformation)
            .then((account) => {
                res.status(200).send(account);
            })
            .catch(next);
    },
    );

router.get('/',
    arbitrate.validateRequest({
        token: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Query
        },
        id: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Query
        }
    }),
    TokenService.middleware.enforceValidAccessToken,
    (req, res, next) => {
        return AccountService.getAccountByExternalId(req.query.id)
            .then((accounts) => {
                res.status(200).json({
                    account: accounts
                });
            })
            .catch(next);
    });

module.exports = router;