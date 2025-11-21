import sequelize from '../config/database';
import { DataTypes } from 'sequelize';

async function applyMigration() {
    try {
        await sequelize.authenticate();
        console.log('🔗 Conectado a la base de datos');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Verificar si la columna ya existe
        const tableInfo = await queryInterface.describeTable('test_questions');
        if (tableInfo['themePart']) {
            console.log('ℹ️  La columna themePart ya existe. Saltando creación.');
        } else {
            console.log('🔄 Añadiendo columna themePart...');
            await queryInterface.addColumn('test_questions', 'themePart', {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 1,
                    max: 10,
                },
                comment: 'Número de parte del tema (1, 2, 3, 4...) o NULL si tema sin partes',
            });
            console.log('✅ Columna themePart añadida');
        }

        // 2. Añadir índice
        try {
            console.log('🔄 Añadiendo índice...');
            await queryInterface.addIndex('test_questions', ['themeId', 'themePart'], {
                name: 'test_questions_theme_part_idx'
            });
            console.log('✅ Índice creado');
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️  El índice ya existe');
            } else {
                throw error;
            }
        }

        console.log('✨ Migración completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

applyMigration();
