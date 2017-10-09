'use strict';

const DB = require('src/util/db.js');


const LoginMethodModel = DB.sequelize.define('LoginMethods', {

    id: {
        type: DB.Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    accountId: {
        type: DB.Sequelize.BIGINT,
        allowNull: false,
    },

    method: {
        type: DB.Sequelize.TEXT,
        allowNull: false,
        validate: {
            isIn: [['password']],
        },
    },

    credentials: {
        type: DB.Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
    },

    metadata: {
        type: DB.Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
    },

}, {
});

module.exports = LoginMethodModel;
