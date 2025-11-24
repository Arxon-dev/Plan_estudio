'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('recompensas', 'tipo', {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('recompensas', 'tipo', {
            type: Sequelize.STRING(100),
            allowNull: false,
        });
    }
};
