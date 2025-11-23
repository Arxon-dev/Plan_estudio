'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('users');

        if (!tableInfo.adminNotes) {
            await queryInterface.addColumn('users', 'adminNotes', {
                type: Sequelize.TEXT,
                allowNull: true,
            });
        }

        if (!tableInfo.isBanned) {
            await queryInterface.addColumn('users', 'isBanned', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }

        if (!tableInfo.banReason) {
            await queryInterface.addColumn('users', 'banReason', {
                type: Sequelize.TEXT,
                allowNull: true,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('users');

        if (tableInfo.banReason) {
            await queryInterface.removeColumn('users', 'banReason');
        }

        if (tableInfo.isBanned) {
            await queryInterface.removeColumn('users', 'isBanned');
        }

        if (tableInfo.adminNotes) {
            await queryInterface.removeColumn('users', 'adminNotes');
        }
    }
};
