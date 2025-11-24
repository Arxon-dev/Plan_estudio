'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('users');

        const columnsToAdd = [
            { name: 'ejercito', type: Sequelize.ENUM('TIERRA', 'ARMADA', 'AIRE_Y_ESPACIO'), allowNull: true },
            { name: 'empleo', type: Sequelize.ENUM('CABO_PRIMERO', 'CABO'), allowNull: true },
            { name: 'agrupacionEspecialidad', type: Sequelize.ENUM('OPERATIVAS', 'TECNICAS'), allowNull: true },
            { name: 'especialidadFundamental', type: Sequelize.STRING(100), allowNull: true },
            { name: 'tiempoServiciosUnidadesPreferentes', type: Sequelize.INTEGER, defaultValue: 0 },
            { name: 'tiempoServiciosOtrasUnidades', type: Sequelize.INTEGER, defaultValue: 0 },
            { name: 'tiempoOperacionesExtranjero', type: Sequelize.INTEGER, defaultValue: 0 },
            { name: 'notaMediaInformes', type: Sequelize.DECIMAL(5, 3), allowNull: true },
            { name: 'flexionesTronco', type: Sequelize.INTEGER, allowNull: true },
            { name: 'flexionesBrazos', type: Sequelize.INTEGER, allowNull: true },
            { name: 'circuitoAgilidad', type: Sequelize.DECIMAL(4, 1), allowNull: true },
            { name: 'reconocimientoMedico', type: Sequelize.ENUM('APTO', 'NO_APTO'), allowNull: true },
            { name: 'pruebaAcertadas', type: Sequelize.INTEGER, allowNull: true },
            { name: 'pruebaErroneas', type: Sequelize.INTEGER, allowNull: true },
            { name: 'pruebaEnBlanco', type: Sequelize.INTEGER, allowNull: true },
            { name: 'puntosMeritosProfesionales', type: Sequelize.DECIMAL(5, 3), defaultValue: 0 },
            { name: 'puntosMeritosAcademicos', type: Sequelize.DECIMAL(5, 3), defaultValue: 0 },
            { name: 'puntosInformesCalificacion', type: Sequelize.DECIMAL(5, 3), defaultValue: 0 },
            { name: 'puntosPruebasFisicas', type: Sequelize.DECIMAL(5, 3), defaultValue: 0 },
            { name: 'puntosConcurso', type: Sequelize.DECIMAL(6, 3), defaultValue: 0 },
            { name: 'puntosOposicion', type: Sequelize.DECIMAL(6, 3), defaultValue: 0 },
            { name: 'puntosTotal', type: Sequelize.DECIMAL(6, 3), defaultValue: 0 },
            { name: 'posicionRanking', type: Sequelize.INTEGER, allowNull: true },
            { name: 'perfilPublico', type: Sequelize.BOOLEAN, defaultValue: true },
        ];

        for (const column of columnsToAdd) {
            if (!tableInfo[column.name]) {
                await queryInterface.addColumn('users', column.name, {
                    type: column.type,
                    allowNull: column.allowNull !== undefined ? column.allowNull : true,
                    defaultValue: column.defaultValue,
                });
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        const columnsToRemove = [
            'ejercito', 'empleo', 'agrupacionEspecialidad', 'especialidadFundamental',
            'tiempoServiciosUnidadesPreferentes', 'tiempoServiciosOtrasUnidades', 'tiempoOperacionesExtranjero',
            'notaMediaInformes', 'flexionesTronco', 'flexionesBrazos', 'circuitoAgilidad',
            'reconocimientoMedico', 'pruebaAcertadas', 'pruebaErroneas', 'pruebaEnBlanco',
            'puntosMeritosProfesionales', 'puntosMeritosAcademicos', 'puntosInformesCalificacion',
            'puntosPruebasFisicas', 'puntosConcurso', 'puntosOposicion', 'puntosTotal',
            'posicionRanking', 'perfilPublico'
        ];

        for (const column of columnsToRemove) {
            await queryInterface.removeColumn('users', column);
        }
    }
};
