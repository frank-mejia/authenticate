'use strict';
const _ = require('lodash');
const uuid = require('uuid');

const PasswordService = require('src/services/password.service.js');
const AccountRepository = require('src/repositories/account.repository');

const formatResponse = (jsonResponse) => {
    const { name, email, externalId } = jsonResponse;
    return {
        id: externalId,
        name,
        email
    };
};

const AccountService = {
    createAccount: (accountInformation) => {
        return PasswordService.hashPassword(accountInformation.password)
            .then((passwordHash) => {
                const account = _.defaultsDeep(accountInformation, {
                    externalId: uuid.v4(),
                    method: 'password',
                    credentials: {
                        hash: passwordHash,
                        hashFunction: 'bcrypt'
                    }
                });
                return AccountRepository.createAccount(account)
            })
            .then(formatResponse);
    },

    getAccountByEmail: (email) => {
        return AccountRepository.getAccountByEmail(email);
    },

    getAllAccounts: () => {
        return AccountRepository.getAllAccounts()
            .then((accounts) => {
                return _.map(accounts, formatResponse);
            })
    },

    getAccountByExternalId: (externalId) => {
        return AccountRepository.getAccountWithExternalId(externalId)
            .then(formatResponse);
    }
};

module.exports = AccountService;