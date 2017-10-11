'use strict';

const router = require('express').Router();
const arbitrate = require('express-arbitrate');

//const Logger = require('src/util/logger.js').passwordRouter;
const AccountService = require('src/services/account.service.js');

const PasswordService = require('src/services/password.service.js');
const EmailService = require('src/services/email.service.js');

router.post('/',
    (req, res, next) => {
    console.log('Received request!');
    console.log(req.body.name);
    next();
    },
    /*
    arbitrate.validateRequest({
        name: {
            type: arbitrate.type.String,
            required: true
        },
        email: {
            type: arbitrate.type.String,
            required: true
        },
        password: {
            type: arbitrate.type.String,
            required: true
        }
    }),
    */
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

module.exports = router;