'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add configuration column
        await queryInterface.addColumn('study_plans', 'configuration', {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Configuration for custom blocks or other methodologies'
        });

        // Update status enum
        // Note: Sequelize doesn't support changing ENUM values easily in all dialects.
        // For MySQL we can use raw query.
        await queryInterface.sequelize.query(`
      ALTER TABLE study_plans 
      MODIFY COLUMN status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DRAFT') 
      NOT NULL DEFAULT 'ACTIVE';
    `);

        // Update methodology enum
        await queryInterface.sequelize.query(`
      ALTER TABLE study_plans 
      MODIFY COLUMN methodology ENUM('rotation', 'monthly-blocks', 'custom-blocks') 
      NOT NULL DEFAULT 'rotation';
    `);
    },

    down: async (queryInterface, Sequelize) => {
        // Remove configuration column
        await queryInterface.removeColumn('study_plans', 'configuration');

        // Revert status enum
        await queryInterface.sequelize.query(`
      ALTER TABLE study_plans 
      MODIFY COLUMN status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED') 
      NOT NULL DEFAULT 'ACTIVE';
    `);

        // Revert methodology enum
        await queryInterface.sequelize.query(`
      ALTER TABLE study_plans 
      MODIFY COLUMN methodology ENUM('rotation', 'monthly-blocks') 
      NOT NULL DEFAULT 'rotation';
    `);
    }
};
