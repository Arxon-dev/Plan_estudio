'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'fechaIngreso', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'fechaAntiguedad', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'fechaIngreso');
        await queryInterface.removeColumn('users', 'fechaAntiguedad');
    }
};
