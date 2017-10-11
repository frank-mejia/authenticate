'use strict';

const router = require('express').Router();
const arbitrate = require('express-arbitrate');

const AuthenticateService = require('src/services/authenticate.service.js');

router.post('/',
    /*
    arbitrate.validateRequest({
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
    (req, res, next) => {
        const {email, password} = req.body;
        return AuthenticateService.authenticate(email, password)
            .then((tokenPair) => {
                res.status(200).send(tokenPair);
            })
            .catch(next);
    },
);

module.exports = router;