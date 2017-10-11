'use strict';

const router = require('express').Router();
const arbitrate = require('express-arbitrate');

const TokenService = require('src/services/token.service.js');

router.post('/revoke',
    arbitrate.validateRequest({
        type: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body
        },
        token: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body
        }
    }),
    (req, res, next) => {
        const {type, token} = req.body;
        return TokenService.revokeToken(token, type)
            .then(() => {
                res.status(200).json({ message: 'Token revoked successfully'});
            })
            .catch(next);
    },
);

router.post('/refresh',
    arbitrate.validateRequest({
        refreshToken: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body
        },
        accessToken: {
            type: arbitrate.type.String,
            required: true,
            location: arbitrate.location.Body
        }
    }),
    (req, res, next) => {
        const {refreshToken, accessToken} = req.body;
        return TokenService.refreshToken(refreshToken, accessToken)
            .then((tokenPair) => {
                res.status(200).send(tokenPair);
            })
            .catch(next);
    },
);
module.exports = router;