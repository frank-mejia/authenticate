'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createAccountsTable(queryInterface, schema, Sequelize);
    },

    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.dropAllTables();
    },

};

const createAccountsTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'Accounts',
        {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },

            externalId: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
            },

            email: {
                type: Sequelize.TEXT,
                allowNull: false,
                unique: true,
            },

            name: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            method: {
                type: Sequelize.TEXT,
                allowNull: false
            },

            credentials: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {},
            },

            refreshToken: {
                type: Sequelize.TEXT,
                allowNull: true,
                unique: true,
            },

            metadata: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {},
            },

            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
        },
        {
            schema: schema
        }
    );
};

module.exports = Migration;
