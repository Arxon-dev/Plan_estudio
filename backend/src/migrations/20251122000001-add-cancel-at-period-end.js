'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('users');
        if (!tableInfo.cancelAtPeriodEnd) {
            await queryInterface.addColumn('users', 'cancelAtPeriodEnd', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('users');
        if (tableInfo.cancelAtPeriodEnd) {
            await queryInterface.removeColumn('users', 'cancelAtPeriodEnd');
        }
    },
};
