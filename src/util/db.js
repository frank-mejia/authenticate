'use strict';

const _         = require('lodash');
const Umzug     = require('umzug');
const Sequelize = require('sequelize');

// Delete PG native: https://github.com/sequelize/sequelize/issues/3781
delete require('pg').native;

const defaults = {
    dialect: 'postgres',
    database: 'postgres',
    username: null,
    password: null,
    schema: 'Auth',
    logging: false,
    define: {
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        defaultScope: {
            order: [
                ['createdAt', 'ASC'],
            ],
        },
    }
};

const prepareSchema = (schema) => {
    if (!schema) {
        return;
    }
    Options.define.schema = schema;
};

const prepareLogging = (logger) => {
    if (Options.logging && logger) {
        Options.logging = logger;
    } else {
        Options.logging = false;
    }
};

const prepareUmzug = () => {
    // Initialize umzug migrations. storageOptions.sequelize is supposed to be optional when specifying the model, but
    // unLogMigration() in umzug uses it to determine the version. DO NOT REMOVE IT.
    DB.umzug = new Umzug({
        storage: 'sequelize',
        logging: Options.logging,
        storageOptions: {
            sequelize: DB.sequelize,
            model: require('../models/migration.model.js'),
            modelName: 'Migrations',
            columnName: 'migration',
        },
        migrations: {
            params: [DB.sequelize.getQueryInterface(), Options.schema, Sequelize],
            path: `${__dirname}/../../migrations`,
            pattern: /^\d+\.\d+\.\d+[\w-]*\.js$/
        }
    });
};

let Options;

/**
 * Main DB access module. Initializes and exposes data access objects and runs migrations.
 *
 * @exports DB
 */
const DB = {
    Sequelize: Sequelize,
    sequelize: {},
    umzug: {},
    initializeWithObject: (options, logger = null) => {
        Options = _.defaults({}, options, defaults);
        DB.sequelize = new Sequelize(Options);
        prepareSchema(options.schema);
        prepareLogging(logger);
        prepareUmzug();
    },
    migrate: () => {
        if (_.isEmpty(DB.umzug)) {
            prepareUmzug();
        }
        return DB.umzug.up();
    },
    getSchema: () => {
        return Options.schema;
    },
    ready: () => {
        return DB.migrate();
    },
};

module.exports = DB;
