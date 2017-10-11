'use strict';

const validator = require('email-validator');

const Err = require('src/util/error.js');

const EmailService = {
    middleware: {
        enforceValidEmail: (req, res, next) => {
            const email = req.body.email;
            const isValidEmail = validator.validate(email);
            if (!isValidEmail) {
                return next(new Err.invalidEmail());
            }
            next();
        }
    }
};

module.exports = EmailService;