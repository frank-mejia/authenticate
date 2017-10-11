'use strict';

const zxcvbn = require('zxcvbn');
const nconf = require('nconf');
const bcrypt = require('bcrypt');

const Err = require('src/util/error.js');

const PasswordService = {
    middleware: {
        enforcePasswordStrength: (req, res, next) => {
            const password = req.body.password;
            const passwordStrengthScore = zxcvbn(password);
            if (passwordStrengthScore < 3) {
                return next(new Err.passwordStrength());
            }
            next();
        }
    },
    hashPassword: (password) => {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
};

module.exports = PasswordService;