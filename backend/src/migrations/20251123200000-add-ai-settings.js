'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const settings = [
            {
                key: 'AI_PROVIDER',
                value: 'openai',
                type: 'string',
                category: 'ai',
                description: 'Proveedor de IA activo',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'OPENAI_API_KEY',
                value: '',
                type: 'string',
                category: 'ai',
                description: 'API Key para OpenAI',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'OPENAI_MODEL',
                value: 'gpt-4',
                type: 'string',
                category: 'ai',
                description: 'Modelo de OpenAI',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'CLAUDE_API_KEY',
                value: '',
                type: 'string',
                category: 'ai',
                description: 'API Key para Anthropic Claude',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'CLAUDE_MODEL',
                value: 'claude-3-5-sonnet-20241022',
                type: 'string',
                category: 'ai',
                description: 'Modelo de Claude',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'GEMINI_API_KEY',
                value: '',
                type: 'string',
                category: 'ai',
                description: 'API Key para Google Gemini',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'GEMINI_MODEL',
                value: 'gemini-1.5-pro',
                type: 'string',
                category: 'ai',
                description: 'Modelo de Gemini',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'DEEPSEEK_API_KEY',
                value: '',
                type: 'string',
                category: 'ai',
                description: 'API Key para DeepSeek',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'DEEPSEEK_MODEL',
                value: 'deepseek-chat',
                type: 'string',
                category: 'ai',
                description: 'Modelo de DeepSeek',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'GLM_API_KEY',
                value: '',
                type: 'string',
                category: 'ai',
                description: 'API Key para Zhipu AI (GLM)',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'GLM_MODEL',
                value: 'glm-4.6',
                type: 'string',
                category: 'ai',
                description: 'Modelo de GLM',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'PERPLEXITY_API_KEY',
                value: '',
                type: 'string',
                category: 'ai',
                description: 'API Key para Perplexity',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: 'PERPLEXITY_MODEL',
                value: 'llama-3.1-sonar-small-128k-online',
                type: 'string',
                category: 'ai',
                description: 'Modelo de Perplexity',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Insertar solo si no existen
        for (const setting of settings) {
            const exists = await queryInterface.rawSelect('system_settings', {
                where: { key: setting.key },
            }, ['key']);

            if (!exists) {
                await queryInterface.bulkInsert('system_settings', [setting]);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        const keys = [
            'AI_PROVIDER',
            'OPENAI_API_KEY', 'OPENAI_MODEL',
            'CLAUDE_API_KEY', 'CLAUDE_MODEL',
            'GEMINI_API_KEY', 'GEMINI_MODEL',
            'DEEPSEEK_API_KEY', 'DEEPSEEK_MODEL',
            'GLM_API_KEY', 'GLM_MODEL',
            'PERPLEXITY_API_KEY', 'PERPLEXITY_MODEL'
        ];

        await queryInterface.bulkDelete('system_settings', {
            key: { [Sequelize.Op.in]: keys }
        });
    }
};
