'use strict';

const AccountModel = require('src/models/account.model.js');
const Err = require('src/util/error.js');

const AccountRepository = {
    createAccount: (accountInformation) => {
        return AccountModel.create(accountInformation)
            .catch((err) => {
                console.log('[ERROR in Account Repository] - Trying to create an account that already exists');
                return Promise.reject(new Err.account.alreadyExists());
            });
    },

    getAccountByEmail: (email) => {
        return AccountModel.find({
            where: {
                email
            }
        });
    },

    removeRefreshTokenFromAccountWithExternalId: (externalId) => {
        return AccountModel.find({
            where: {
                externalId
            }
        })
            .then((account) => {
                if (account) {
                    account.refreshToken = "";
                    return account.save();
                }
                return Promise.reject(new Err('Account with provided id does not exist'));
            })
    },

    getAccountWithExternalId: (externalId) => {
        return AccountModel.find({
            where: {
                externalId
            }
        })
            .then((account) => {
                if (account) {
                    return account;
                }
                return Promise.reject(new Err('Account with provided id does not exist'));
            })
    }
};

module.exports = AccountRepository;