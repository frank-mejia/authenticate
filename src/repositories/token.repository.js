'use strict';

const config = require('nconf');

const AccountRepository = require('src/repositories/account.repository.js');
const Cache = require('src/util/cache.js');


const TokenRepository = {
    persistToken: (token, accountId, type) => {
        const key = `${accountId}-${type}-token-${token}`;
        return Cache.put(key, true)
            .then(() => {
                if (type === 'access') {
                    // Set expiration
                    return Cache.expire(key, config.get('jwt:accessTokenExpiry'))
                }
                return Promise.resolve();
            })
    },

    revokeAccessToken: (token) => {
        // Add token to blacklist
        const key = `access-token-blacklist-${token}`;
        return Cache.put(key, true)
            .then(() => {
                return Cache.expire(key, config.get('jwt:accessTokenExpiry'));
            });
    },

    revokeRefreshToken: (decodedToken) => {
        // first remove refreshToken from DB
        return AccountRepository.removeRefreshTokenFromAccountWithExternalId(decodedToken.sub);
    },
};

module.exports = TokenRepository;