'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createAccountsTable(queryInterface, schema, Sequelize)
            .then(() => {
                return createLoginMethodsTable(queryInterface, schema, Sequelize);
            });
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

            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
        },
        {
            schema: schema
        }
    );
};

const createLoginMethodsTable = (queryInterface, schema, Sequelize) => {
    return queryInterface.createTable(
        'LoginMethods',
        {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },

            accountId: {
                type: Sequelize.BIGINT,
                references: {
                    model: {
                        schema: schema,
                        tableName: 'Accounts',
                    },
                    key: 'id',
                },
                onUpdate: 'cascade',
                onDelete: 'cascade',
            },

            scheme: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            credentials: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {},
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
