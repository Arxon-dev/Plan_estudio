'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create subscription_plans table
    await queryInterface.createTable('subscription_plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'EUR'
      },
      interval: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'month'
      },
      features: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      stripePriceId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      buttonText: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      buttonLink: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    // Create marketing_sections table
    await queryInterface.createTable('marketing_sections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      page: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      sectionId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      content: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add unique index to marketing_sections
    await queryInterface.addIndex('marketing_sections', ['page', 'sectionId'], {
      unique: true,
      name: 'marketing_sections_page_section_unique'
    });

    // Seed Data
    const now = new Date();

    // Seed Plans
    await queryInterface.bulkInsert('subscription_plans', [
      {
        name: 'Gratuito',
        price: 0.00,
        currency: 'EUR',
        interval: 'month',
        features: JSON.stringify([
          'Tests normales por tema',
          'Historial de tests',
          'Estadísticas básicas',
          'Ranking público',
          'Progreso por temas'
        ]),
        isFeatured: false,
        isActive: true,
        order: 1,
        buttonText: 'Para empezar',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Premium',
        price: 10.00,
        currency: 'EUR',
        interval: 'month',
        features: JSON.stringify([
          'Tests Enfocados en Debilidades',
          'Tests Adaptativos con IA',
          'Análisis de Rendimiento con IA',
          'Recomendaciones Personalizadas',
          'Predicción de Nota de Examen',
          'Estadísticas Avanzadas'
        ]),
        isFeatured: true,
        isActive: true,
        order: 2,
        stripePriceId: 'price_1QO8q2L4x6g1q2w3e4r5t6y7', // Placeholder
        buttonText: '¡Quiero ser Premium!',
        createdAt: now,
        updatedAt: now
      }
    ]);

    // Seed Marketing Sections
    await queryInterface.bulkInsert('marketing_sections', [
      {
        page: 'pricing',
        sectionId: 'hero',
        content: JSON.stringify({
          badge: '✨ Convocatoria 2026 - Preparación Permanencia FAS',
          title: 'Tu Plaza de Permanencia Comienza Aquí',
          subtitle: 'La plataforma de preparación más avanzada para la Permanencia en las Fuerzas Armadas. Tecnología IA + Sistema comprobado = Tu éxito garantizado',
          ctaPrimary: 'Suscribirse Ahora',
          ctaSecondary: 'Ver Características'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        page: 'pricing',
        sectionId: 'features_intro',
        content: JSON.stringify({
          title: '¿Por qué OpoMelilla?',
          subtitle: 'La plataforma más completa con tecnología de vanguardia para tu éxito'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        page: 'pricing',
        sectionId: 'final_cta',
        content: JSON.stringify({
          title: '¿Listo para Conseguir tu Plaza?',
          subtitle: 'Únete a miles de opositores que ya están preparándose con la tecnología más avanzada',
          ctaPrimary: 'Suscribirse Ahora',
          ctaSecondary: 'Volver al Plan de Estudio'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('marketing_sections');
    await queryInterface.dropTable('subscription_plans');
  }
};
