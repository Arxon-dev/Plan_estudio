'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'sexo', {
            type: Sequelize.ENUM('H', 'M'),
            allowNull: true,
            defaultValue: 'H', // Default to Male if unknown, or null? Better null but for scoring we need it. I'll leave it nullable and handle it in service.
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'sexo');
    }
};
