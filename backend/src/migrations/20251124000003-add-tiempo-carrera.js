'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'tiempoCarrera', {
            type: Sequelize.INTEGER, // Seconds
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'tiempoCarrera');
    }
};
