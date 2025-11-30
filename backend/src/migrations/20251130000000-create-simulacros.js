'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create Simulacros table
    await queryInterface.createTable('simulacros', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      question_ids: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      time_limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. Add simulacro_id to test_attempts
    await queryInterface.addColumn('test_attempts', 'simulacro_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'simulacros',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('test_attempts', 'simulacro_id');
    await queryInterface.dropTable('simulacros');
  },
};
