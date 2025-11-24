'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('titulaciones', 'nivel', {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('titulaciones', 'nivel', {
            type: Sequelize.STRING(50),
            allowNull: false,
        });
    }
};
