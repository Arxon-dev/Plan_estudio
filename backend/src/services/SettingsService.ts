import SystemSetting from '../models/SystemSetting';

// Cache simple en memoria para evitar consultas constantes a BD
// En producción con múltiples instancias, usar Redis
let settingsCache: Record<string, any> | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minuto

class SettingsService {
    // Definiciones por defecto con metadatos
    private readonly DEFINITIONS: Record<string, { value: any, category: string, description: string, type: 'string' | 'number' | 'boolean' | 'json' }> = {
        // Límites
        'TEST_DAILY_LIMIT_FREE': {
            value: 10,
            category: 'limits',
            description: 'Límite de tests diarios para usuarios gratuitos',
            type: 'number'
        },
        'TEST_DAILY_LIMIT_PREMIUM': {
            value: 999,
            category: 'limits',
            description: 'Límite de tests diarios para usuarios Premium',
            type: 'number'
        },
        'TEST_MONTHLY_LIMIT_FREE': {
            value: 10,
            category: 'limits',
            description: 'Límite de tests mensuales para usuarios gratuitos',
            type: 'number'
        },
        'TEST_PASS_THRESHOLD': {
            value: 70,
            category: 'limits',
            description: 'Nota mínima para aprobar un test',
            type: 'number'
        },
        'AI_QUESTIONS_LIMIT': {
            value: 50,
            category: 'ai',
            description: 'Máximo de preguntas generadas por petición',
            type: 'number'
        },
        'AI_MONTHLY_LIMIT_FREE': {
            value: 20,
            category: 'limits',
            description: 'Límite mensual de consultas al chat IA para usuarios gratuitos',
            type: 'number'
        },
        'AI_MONTHLY_LIMIT_PREMIUM': {
            value: 500,
            category: 'limits',
            description: 'Límite mensual de consultas al chat IA para usuarios Premium',
            type: 'number'
        },

        // IA
        'AI_MODEL': {
            value: 'gpt-4o',
            category: 'ai',
            description: 'Modelo de IA utilizado (ej: gpt-4o, gpt-3.5-turbo)',
            type: 'string'
        },
        'AI_CREATIVITY': {
            value: 0.7,
            category: 'ai',
            description: 'Nivel de creatividad (Temperatura 0.0 - 1.0)',
            type: 'number'
        },
        'AI_SYSTEM_PROMPT': {
            value: 'Eres un experto en oposiciones militares españolas.',
            category: 'ai',
            description: 'Prompt del sistema para la generación de preguntas',
            type: 'string'
        },
        'AI_PROVIDER': {
            value: 'openai',
            category: 'ai',
            description: 'Proveedor de IA activo',
            type: 'string'
        },
        'OPENAI_API_KEY': {
            value: '',
            category: 'ai',
            description: 'API Key para OpenAI',
            type: 'string'
        },
        'OPENAI_MODEL': {
            value: 'gpt-4',
            category: 'ai',
            description: 'Modelo de OpenAI',
            type: 'string'
        },
        'CLAUDE_API_KEY': {
            value: '',
            category: 'ai',
            description: 'API Key para Anthropic Claude',
            type: 'string'
        },
        'CLAUDE_MODEL': {
            value: 'claude-3-5-sonnet-20241022',
            category: 'ai',
            description: 'Modelo de Claude',
            type: 'string'
        },
        'GEMINI_API_KEY': {
            value: '',
            category: 'ai',
            description: 'API Key para Google Gemini',
            type: 'string'
        },
        'GEMINI_MODEL': {
            value: 'gemini-2.5-pro',
            category: 'ai',
            description: 'Modelo de Gemini',
            type: 'string'
        },
        'DEEPSEEK_API_KEY': {
            value: '',
            category: 'ai',
            description: 'API Key para DeepSeek',
            type: 'string'
        },
        'DEEPSEEK_MODEL': {
            value: 'deepseek-chat',
            category: 'ai',
            description: 'Modelo de DeepSeek',
            type: 'string'
        },
        'GLM_API_KEY': {
            value: '',
            category: 'ai',
            description: 'API Key para Zhipu AI (GLM)',
            type: 'string'
        },
        'GLM_MODEL': {
            value: 'glm-4.6',
            category: 'ai',
            description: 'Modelo de GLM',
            type: 'string'
        },
        'PERPLEXITY_API_KEY': {
            value: '',
            category: 'ai',
            description: 'API Key para Perplexity',
            type: 'string'
        },
        'PERPLEXITY_MODEL': {
            value: 'llama-3.1-sonar-small-128k-online',
            category: 'ai',
            description: 'Modelo de Perplexity',
            type: 'string'
        },

        // General
        'SITE_NAME': {
            value: 'OpoMelilla',
            category: 'general',
            description: 'Nombre de la aplicación',
            type: 'string'
        },
        'MAINTENANCE_MODE': {
            value: false,
            category: 'general',
            description: 'Activar modo mantenimiento',
            type: 'boolean'
        },
        'ANNOUNCEMENT_BANNER': {
            value: '',
            category: 'general',
            description: 'Banner de anuncios global',
            type: 'string'
        },
    };

    /**
     * Inicializar caché
     */
    private async loadCache() {
        const now = Date.now();
        if (settingsCache && (now - lastCacheUpdate < CACHE_TTL)) {
            return;
        }

        const settings = await SystemSetting.findAll();
        settingsCache = {};

        // Llenar caché con valores de BD
        for (const setting of settings) {
            settingsCache[setting.key] = setting.getTypedValue();
        }

        lastCacheUpdate = now;
    }

    /**
     * Obtener un valor de configuración
     */
    async get<T>(key: string, defaultValue?: T): Promise<T> {
        await this.loadCache();

        if (settingsCache && key in settingsCache) {
            return settingsCache[key] as T;
        }

        // Si no está en BD, devolver default de las definiciones o el pasado por argumento
        const def = this.DEFINITIONS[key];
        return (defaultValue !== undefined ? defaultValue : (def ? def.value : undefined)) as T;
    }

    /**
     * Obtener todas las configuraciones organizadas por categoría
     */
    async getAll() {
        await this.loadCache();

        const allSettings: Record<string, any> = {};
        const metadata: Record<string, any> = {};

        // 1. Cargar definiciones por defecto
        for (const [key, def] of Object.entries(this.DEFINITIONS)) {
            allSettings[key] = def.value;
            metadata[key] = {
                description: def.description,
                category: def.category,
                type: def.type
            };
        }

        // 2. Sobrescribir con valores de BD (si existen)
        if (settingsCache) {
            Object.assign(allSettings, settingsCache);
        }

        // 3. Actualizar metadatos con info de BD (si existe)
        const dbSettings = await SystemSetting.findAll();
        dbSettings.forEach(s => {
            if (metadata[s.key]) {
                // Si ya existe (es un default), actualizamos sus metadatos si la BD tiene algo distinto
                if (s.description) metadata[s.key].description = s.description;
                if (s.category) metadata[s.key].category = s.category;
                if (s.type) metadata[s.key].type = s.type;
            } else {
                // Si es un setting nuevo solo en BD
                metadata[s.key] = {
                    description: s.description,
                    category: s.category,
                    type: s.type
                };
            }

            // Ofuscar API Keys
            if (s.key.endsWith('_API_KEY') && allSettings[s.key]) {
                const val = String(allSettings[s.key]);
                if (val.length > 8) {
                    allSettings[s.key] = val.substring(0, 3) + '...' + val.substring(val.length - 4);
                } else if (val.length > 0) {
                    allSettings[s.key] = '********';
                }
            }
        });

        return {
            settings: allSettings,
            metadata
        };
    }

    /**
     * Obtener proveedor de IA activo
     */
    async getAIProvider(): Promise<string> {
        return this.get<string>('AI_PROVIDER', 'openai');
    }

    /**
     * Obtener configuración completa para un proveedor
     */
    async getAIConfig(provider: string): Promise<{ apiKey: string, model: string }> {
        const providerUpper = provider.toUpperCase();
        const apiKey = await this.get<string>(`${providerUpper}_API_KEY`, '');
        const model = await this.get<string>(`${providerUpper}_MODEL`, '');
        return { apiKey, model };
    }

    /**
     * Establecer proveedor de IA activo
     */
    async setAIProvider(provider: string): Promise<void> {
        await this.set('AI_PROVIDER', provider, 'ai', 'Proveedor de IA activo');
    }

    /**
     * Actualizar una configuración
     */
    async set(key: string, value: any, category: string = 'general', description?: string) {
        let type: 'string' | 'number' | 'boolean' | 'json' = 'string';
        let stringValue = String(value);

        if (typeof value === 'number') {
            type = 'number';
        } else if (typeof value === 'boolean') {
            type = 'boolean';
        } else if (typeof value === 'object') {
            type = 'json';
            stringValue = JSON.stringify(value);
        }

        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key },
            defaults: {
                key,
                value: stringValue,
                type,
                category: category as any,
                description,
                isPublic: false
            }
        });

        if (!created) {
            await setting.update({
                value: stringValue,
                type, // Actualizar tipo por si cambia
                category: category as any,
                description: description || setting.description
            });
        }

        // Invalidar caché
        settingsCache = null;

        return setting;
    }

    /**
     * Actualizar múltiples configuraciones
     */
    async updateBulk(settings: Array<{ key: string; value: any; category?: string }>) {
        for (const s of settings) {
            await this.set(s.key, s.value, s.category);
        }
        return true;
    }
}

export default new SettingsService();
