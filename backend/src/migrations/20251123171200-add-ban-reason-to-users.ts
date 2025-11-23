import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.addColumn('users', 'banReason', {
            type: DataTypes.TEXT,
            allowNull: true,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn('users', 'banReason');
    },
};
