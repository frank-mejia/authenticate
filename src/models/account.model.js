'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const uuidValidate = require('uuid-validate');

const DB = require('src/util/db.js');


const AccountModel = DB.sequelize.define('Accounts', {

    id: {
        type: DB.Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    externalId: {
        type: DB.Sequelize.UUID,
        allowNull: false,
        unique: true,
    },

    name: {
        type: DB.Sequelize.TEXT,
        allowNull: true,
    },

    email: {
        type: DB.Sequelize.TEXT,
        allowNull: false,
        unique: true,
    },

    method: {
        type: DB.Sequelize.TEXT,
        allowNull: true,
        validate: {
            isIn: [['password']],
        },
    },

    credentials: {
        type: DB.Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
    },

    refreshToken: {
        type: DB.Sequelize.TEXT,
        allowNull: true,
        unique: true,
    },

    metadata: {
        type: DB.Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
    },

},{});

module.exports = AccountModel;
