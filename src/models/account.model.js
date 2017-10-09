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
    }

},{});

module.exports = AccountModel;
