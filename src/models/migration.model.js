'use strict';

const DB = require('src/util/db.js');

const MigrationsModel = DB.sequelize.define('Migrations', {
    migration: {
        type: DB.Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
}, {
    schema: DB.getSchema(),
    createdAt: 'executedAt',
    updatedAt: false,
    paranoid: false
});

module.exports = MigrationsModel;
