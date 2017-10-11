'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');
const uuid = require('uuid');
const config = require('nconf');

const TokenRepository = require('src/repositories/token.repository.js');
const AccountRepository = require('src/repositories/account.repository.js');
const Err = require('src/util/error.js');

const TokenService = {
    generateToken: (payload, options) => {
        return new Promise((resolve, reject) => {
            const token = jwt.sign(payload, config.get('jwt:privateKey'), options);
            if (token) {
                resolve(token);
            } else {
                reject(token);
            }
        });
    },
    generateTokenPair: (account) => {
        return new Promise((resolve, reject) => {
            const defaultPayload = {
                user: {
                    name: account.name,
                    email: account.email
                },
                method: account.method,
            };

            const accessTokenPayload = _.defaults({
                type: 'access'
            }, defaultPayload);

            const refreshTokenPayload = _.defaults({
                type: 'refresh'
            }, defaultPayload);

            const defaultTokenOptions = {
                subject: account.externalId || account.id,
                jwtid: uuid.v4(),
                algorithm: config.get('jwt:algorithm'),
                issuer: config.get('service:name')
            };

            const accessTokenOptions = _.defaults({
                expiresIn: config.get('jwt:accessTokenExpiry')
            }, defaultTokenOptions);

            const refreshTokenPromise = TokenService.generateToken(refreshTokenPayload, defaultTokenOptions);
            const accessTokenPromise = TokenService.generateToken(accessTokenPayload, accessTokenOptions);

            return Promise.all([refreshTokenPromise, accessTokenPromise])
                .then(([refreshToken, accessToken]) => {
                    resolve({
                        refreshToken,
                        accessToken
                    })
                });
        })
    },

    generateAccessToken: (account) => {
        const payload = {
            user: {
                name: account.name,
                email: account.email
            },
            method: account.method,
            type: 'access'
        };

        const options = {
            subject: account.externalId || account.id,
            jwtid: uuid.v4(),
            algorithm: config.get('jwt:algorithm'),
            issuer: config.get('service:name'),
            expiresIn: config.get('jwt:accessTokenExpiry')
        };
        return TokenService.generateToken(payload, options)
            .then((accessToken) => {
                return { accessToken };
            });
    },

    revokeToken: (token, type) => {
        return TokenService.verifyToken(token, type)
            .then((decodedToken) => {
                if (type === 'access') {
                    return TokenRepository.revokeAccessToken(token);
                } else if (type === 'refresh') {
                    return TokenRepository.revokeRefreshToken(decodedToken);
                } else {
                    // Invalid token type specified
                    return Promise.reject(new Error('Invalid token type passed to TokenService.revokeToken'));
                }
            });
    },

    refreshToken: (refreshToken, accessToken) => {
        return Promise.all([
            TokenService.verifyToken(refreshToken, 'refresh'),
            TokenService.verifyToken(accessToken, 'access', { ignoreExpiration: true })
        ])
            .then(([decodedRefreshToken]) => {
                // Check if refresh token is still valid.
                const externalId = decodedRefreshToken.sub;
                return AccountRepository.getAccountWithExternalId(externalId)
                    .then((account) => {
                        if (account.refreshToken === refreshToken) {
                            // then it is valid
                            // generate a new access token
                            return TokenService.generateAccessToken(account)
                                .then((token) => {
                                    return TokenService.persistToken(token.accessToken, externalId, 'access')
                                        .then(() => {
                                            return {
                                                refreshToken,
                                                accessToken: token.accessToken
                                            };
                                        });
                                });
                        } else {
                            return Promise.reject(new Error('Invalid refresh token provided.'));
                        }
                    });
            })
    },

    verifyToken: (token, type, opts={}) => {
        return new Promise((resolve, reject) => {
            const options = _.defaults({
                issuer: config.get('service:name')
            }, opts);
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, config.get('jwt:publicKey'), options);
            }
            catch (err) {
                reject(new Err.token());
            }

            if (decodedToken.type === type) {
                resolve(decodedToken);
            } else {
                reject(new Err.token());
            }
        });

    },

    persistTokenPair: (tokenPair, accountId) => {
        return Promise.all([
            TokenService.persistToken(tokenPair.refreshToken, accountId, 'refresh'),
            TokenService.persistToken(tokenPair.accessToken, accountId, 'access')
        ]);
    },

    persistToken: (token, accountId, type) => {
        return TokenRepository.persistToken(token, accountId, type);
    }
};

module.exports = TokenService;