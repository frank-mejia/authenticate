'use strict';

const bcrypt = require('bcrypt');

const AccountService = require('./account.service.js');
const TokenService = require('./token.service.js');
const Err = require('src/util/error.js');

const AuthenticateService = {

    authenticate: (email, password) => {
        let account;
        let tokenPair;
        return AccountService.getAccountByEmail(email)
            .then((_account) => {
                account = _account;
                const passwordHash = account.credentials.hash;
                return bcrypt.compare(password, passwordHash);
            })
            .then((validCredentials) => {
                let tokenPairPromise;
                if (validCredentials) {
                    if (!account.refreshToken) {
                        // If user does not not have an existing refresh token
                        tokenPairPromise = TokenService.generateTokenPair(account);
                    } else {
                        // Otherwise just generate a new access token
                        tokenPairPromise = TokenService.generateAccessToken(account);
                    }
                    return tokenPairPromise
                        .then((tokenResponse) => {
                            if (!tokenResponse.refreshToken) {
                                tokenPair = {
                                    refreshToken: account.refreshToken,
                                    accessToken: tokenResponse.accessToken
                                };
                                return Promise.resolve();

                            } else {
                                tokenPair = tokenResponse;
                                account.refreshToken = tokenPair.refreshToken;
                                return account.save();
                            }
                        })
                        .then(() => {
                            return TokenService.persistTokenPair(tokenPair, account.externalId);
                        })
                        .then(() => {
                            return tokenPair;
                        });

                } else {
                    return Promise.reject(new Err.account.invalidCredentials());
                }
            })
    }
};

module.exports = AuthenticateService;