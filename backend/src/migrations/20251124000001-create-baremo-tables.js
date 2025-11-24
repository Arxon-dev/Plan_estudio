'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Recompensas
        await queryInterface.createTable('recompensas', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tipo: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            puntos: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Titulacion
        await queryInterface.createTable('titulaciones', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true, // Una titulación por usuario para baremo
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            nivel: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            puntos: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Idiomas
        await queryInterface.createTable('idiomas', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            idioma: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            nivel: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            puntos: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Cursos Militares
        await queryInterface.createTable('cursos_militares', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tipo: {
                type: Sequelize.ENUM('ESPECIALIZACION', 'INFORMATIVO'),
                allowNull: false,
            },
            nombreCurso: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            puntos: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('cursos_militares');
        await queryInterface.dropTable('idiomas');
        await queryInterface.dropTable('titulaciones');
        await queryInterface.dropTable('recompensas');
    }
};
