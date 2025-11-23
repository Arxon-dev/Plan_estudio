'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create blocks table
    await queryInterface.createTable('blocks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

    // 2. Insert default blocks
    const blocks = [
      {
        code: 'ORGANIZACION',
        name: 'Organización',
        description: 'Estructura y organización del Estado y la Administración Pública',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'JURIDICO_SOCIAL',
        name: 'Jurídico-Social',
        description: 'Derecho administrativo, constitucional y normativa social',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SEGURIDAD_NACIONAL',
        name: 'Seguridad Nacional',
        description: 'Fuerzas y Cuerpos de Seguridad, protección civil y emergencias',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('blocks', blocks);

    // 3. Add blockId to themes
    await queryInterface.addColumn('themes', 'blockId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true, // Temporarily true to allow migration
      references: {
        model: 'blocks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 4. Update themes with blockId based on block enum
    // We need to fetch the blocks first to get their IDs
    // Since we can't easily use models here, we'll use raw queries or assumption of IDs if auto-increment is predictable (risky).
    // Better to use a raw query update.

    // However, in SQLite/MySQL raw update with join can be tricky in Sequelize migration.
    // Let's try to fetch blocks first.
    const [fetchedBlocks] = await queryInterface.sequelize.query("SELECT id, code FROM blocks");

    for (const block of fetchedBlocks) {
      await queryInterface.sequelize.query(
        `UPDATE themes SET blockId = ${block.id} WHERE block = '${block.code}'`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('themes', 'blockId');
    await queryInterface.dropTable('blocks');
  }
};
