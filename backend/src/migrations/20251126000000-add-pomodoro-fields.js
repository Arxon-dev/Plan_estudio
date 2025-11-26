'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add fields to study_sessions
        await queryInterface.addColumn('study_sessions', 'pomodorosCompleted', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        });

        await queryInterface.addColumn('study_sessions', 'actualDuration', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: 'Duration in minutes'
        });

        await queryInterface.addColumn('study_sessions', 'concentrationScore', {
            type: Sequelize.FLOAT,
            defaultValue: 0,
            allowNull: false,
            comment: 'Score from 0.0 to 100.0'
        });

        await queryInterface.addColumn('study_sessions', 'interruptions', {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        });

        await queryInterface.addColumn('study_sessions', 'lastHeartbeat', {
            type: Sequelize.DATE,
            allowNull: true
        });

        // Add fields to users
        await queryInterface.addColumn('users', 'pomodoroSettings', {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'JSON with workDuration, shortBreak, longBreak, etc.'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove fields from study_sessions
        await queryInterface.removeColumn('study_sessions', 'pomodorosCompleted');
        await queryInterface.removeColumn('study_sessions', 'actualDuration');
        await queryInterface.removeColumn('study_sessions', 'concentrationScore');
        await queryInterface.removeColumn('study_sessions', 'interruptions');
        await queryInterface.removeColumn('study_sessions', 'lastHeartbeat');

        // Remove fields from users
        await queryInterface.removeColumn('users', 'pomodoroSettings');
    }
};
