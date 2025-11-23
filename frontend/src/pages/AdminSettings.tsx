import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowDownOnSquareIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    CircleStackIcon,
    InformationCircleIcon,
    ArrowLeftIcon,
    BeakerIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '../components/common/Tooltip';

const SETTING_LABELS: Record<string, string> = {
    // General
    'SITE_NAME': 'Nombre del Sitio',
    'MAINTENANCE_MODE': 'Modo Mantenimiento',
    'MAINTENANCE_MESSAGE': 'Mensaje de Mantenimiento',
    'SUPPORT_EMAIL': 'Email de Soporte',
    'ANNOUNCEMENT_BANNER': 'Banner de Anuncios',

    // Límites
    'TEST_DAILY_LIMIT_FREE': 'Límite Diario de Tests (Gratuito)',
    'TEST_DAILY_LIMIT_PREMIUM': 'Límite Diario de Tests (Premium)',
    'TEST_MONTHLY_LIMIT_FREE': 'Límite Mensual de Tests (Gratuito)',
    'TEST_MONTHLY_LIMIT_PREMIUM': 'Límite Mensual de Tests (Premium)',
    'TEST_TIME_LIMIT': 'Tiempo por Test (minutos)',
    'TEST_QUESTIONS_LIMIT': 'Preguntas por Test',
    'TEST_PASS_THRESHOLD': 'Nota de Corte para Aprobar (%)',

    // IA
    'OPENAI_API_KEY': 'API Key IA (OpenAI)',
    'AI_QUESTIONS_LIMIT': 'Límite de Preguntas IA (por generación)',
    'AI_MODEL': 'Modelo de Inteligencia Artificial',
    'AI_CREATIVITY': 'Nivel de Creatividad (0.0 - 1.0)',
    'AI_SYSTEM_PROMPT': 'Prompt del Sistema (Instrucciones Base)',
};

const HELP_TEXTS: Record<string, string> = {
    'TEST_DAILY_LIMIT_FREE': 'Tests diarios para usuarios gratuitos (ej: 10)',
    'TEST_DAILY_LIMIT_PREMIUM': 'Para Premium (999 = ilimitado)',
    'TEST_MONTHLY_LIMIT_FREE': 'Tests mensuales para usuarios gratuitos (ej: 30)',
    'TEST_MONTHLY_LIMIT_PREMIUM': 'Para Premium (999 = ilimitado)',
    'TEST_TIME_LIMIT': 'Minutos máximos (0 = sin límite)',
    'TEST_QUESTIONS_LIMIT': 'Cantidad en cada test generado (ej: 20)',
    'OPENAI_API_KEY': 'Clave OpenAI para generación (sk-...)',
    'MAINTENANCE_MODE': 'ON: web inaccesible (admins sí) | OFF: normal',
    'MAINTENANCE_MESSAGE': 'Texto personalizado durante mantenimiento',
    'SUPPORT_EMAIL': 'Visible en página de contacto',
    'AI_PROVIDER': 'Selecciona el proveedor de IA activo',
    'AI_SYSTEM_PROMPT': 'Instrucciones base para el comportamiento de la IA',
    'AI_CREATIVITY': '0.0 (determinista) a 1.0 (creativo)',
};

const AI_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'claude', name: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'] },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'] },
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-v3', 'deepseek-chat', 'deepseek-coder'] },
    { id: 'glm', name: 'Zhipu AI (GLM)', models: ['glm-4.6', 'glm-4', 'glm-3-turbo'] },
    { id: 'perplexity', name: 'Perplexity', models: ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online'] },
];

const AdminSettings: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [metadata, setMetadata] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'limits' | 'ai' | 'roles' | 'maintenance'>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Validation state
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationResults, setValidationResults] = useState<{
        critical: string[];
        warnings: string[];
        correct: string[];
    }>({ critical: [], warnings: [], correct: [] });

    // AI Testing state
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; model?: string } | null>(null);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            setSettings(response.data.settings);
            setMetadata(response.data.metadata);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Error al cargar configuraciones' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            // Convertir settings a array para el backend
            const settingsArray = Object.entries(settings).map(([key, value]) => {
                const meta = metadata[key] || {};
                return {
                    key,
                    value,
                    category: meta.category || 'general'
                };
            });

            await api.put('/admin/settings', { settings: settingsArray });
            setMessage({ type: 'success', text: 'Configuraciones guardadas correctamente' });

            // Recargar para asegurar consistencia
            await fetchSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Error al guardar configuraciones' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleShowKey = (key: string) => {
        setShowKey(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTestConnection = async (provider: string) => {
        try {
            setTestingConnection(true);
            setTestResult(null);
            const providerUpper = provider.toUpperCase();
            const apiKey = settings[`${providerUpper}_API_KEY`];
            const model = settings[`${providerUpper}_MODEL`];

            const response = await api.post('/admin/system/test-ai-connection', {
                provider,
                apiKey,
                model
            });

            setTestResult({
                success: true,
                message: response.data.message,
                model: response.data.model
            });
        } catch (error: any) {
            console.error('Error testing connection:', error);
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'Error al probar conexión'
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const validateSettings = () => {
        const critical: string[] = [];
        const warnings: string[] = [];
        const correct: string[] = [];

        // Helper to check if a field exists in settings
        const getValue = (key: string) => settings[key];

        // 🔴 Red (Critical)
        const apiKey = getValue('OPENAI_API_KEY');
        if (!apiKey || !String(apiKey).startsWith('sk-')) {
            critical.push('API Key IA: vacía o inválida (debe empezar con "sk-")');
        } else {
            correct.push('API Key IA configurada');
        }

        const supportEmail = getValue('SUPPORT_EMAIL');
        if (!supportEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(supportEmail))) {
            critical.push('Email soporte: vacío o formato inválido');
        } else {
            correct.push('Email soporte válido');
        }

        const limitFree = Number(getValue('TEST_MONTHLY_LIMIT_FREE'));
        if (limitFree <= 0) {
            critical.push('Límite tests (free): debe ser mayor a 0');
        }

        const limitPremium = Number(getValue('TEST_MONTHLY_LIMIT_PREMIUM'));
        if (limitPremium <= 0) {
            critical.push('Límite tests (premium): debe ser mayor a 0');
        }

        const questionsLimit = Number(getValue('TEST_QUESTIONS_LIMIT'));
        if (questionsLimit <= 0) {
            critical.push('Preguntas por test: debe ser mayor a 0');
        }

        // ⚠️ Yellow (Warning)
        if (getValue('MAINTENANCE_MODE') === true || getValue('MAINTENANCE_MODE') === 'true') {
            warnings.push('Modo mantenimiento: ACTIVADO');
            if (!getValue('MAINTENANCE_MESSAGE')) {
                warnings.push('Mensaje mantenimiento: vacío (se recomienda poner uno)');
            }
        } else {
            correct.push('Modo mantenimiento: DESACTIVADO');
        }

        if (limitFree > 0 && limitFree < 2) {
            warnings.push('Límite tests (free): muy bajo (< 2)');
        } else if (limitFree >= 2) {
            correct.push('Límite tests (free) razonable');
        }

        if (limitPremium > 0 && limitPremium < 10) {
            warnings.push('Límite tests (premium): muy bajo (< 10)');
        } else if (limitPremium >= 10) {
            correct.push('Límite tests (premium) razonable');
        }

        const timeLimit = Number(getValue('TEST_TIME_LIMIT'));
        if (timeLimit > 0 && timeLimit < 10) {
            warnings.push('Tiempo por test: muy bajo (< 10 min)');
        } else if (timeLimit >= 10 || timeLimit === 0) {
            correct.push('Tiempo por test razonable');
        }

        setValidationResults({ critical, warnings, correct });
        setShowValidationModal(true);
    };

    const getGlobalStatus = () => {
        // Calculate status on the fly based on current settings
        // This duplicates some logic but keeps it simple for rendering
        const apiKey = settings['OPENAI_API_KEY'];
        const supportEmail = settings['SUPPORT_EMAIL'];
        const limitFree = Number(settings['TEST_MONTHLY_LIMIT_FREE']);
        const limitPremium = Number(settings['TEST_MONTHLY_LIMIT_PREMIUM']);
        const questionsLimit = Number(settings['TEST_QUESTIONS_LIMIT']);

        if (
            (!apiKey || !String(apiKey).startsWith('sk-')) ||
            (!supportEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(supportEmail))) ||
            (limitFree <= 0) ||
            (limitPremium <= 0) ||
            (questionsLimit <= 0)
        ) {
            return 'critical';
        }

        if (
            (settings['MAINTENANCE_MODE'] === true || settings['MAINTENANCE_MODE'] === 'true') ||
            (limitFree < 2) ||
            (limitPremium < 10) ||
            (Number(settings['TEST_TIME_LIMIT']) > 0 && Number(settings['TEST_TIME_LIMIT']) < 10)
        ) {
            return 'warning';
        }

        return 'success';
    };

    const renderInput = (key: string, value: any, meta: any) => {
        const type = meta?.type || (typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string');

        if (type === 'boolean') {
            return (
                <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value === true || value === 'true'}
                            onChange={(e) => handleChange(key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            );
        }

        if (type === 'number') {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(key, Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
            );
        }

        if (key === 'AI_SYSTEM_PROMPT' || type === 'json') {
            return (
                <textarea
                    value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    rows={5}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border font-mono"
                />
            );
        }

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
        );
    };

    const renderAISection = () => {
        const activeProvider = settings['AI_PROVIDER'] || 'openai';

        return (
            <div className="space-y-6">
                {/* Active Provider Selector */}
                <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <CpuChipIcon className="h-6 w-6 mr-2 text-blue-600" />
                        Proveedor Activo
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selecciona el proveedor que generará las preguntas
                            </label>
                            <select
                                value={activeProvider}
                                onChange={(e) => handleChange('AI_PROVIDER', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                {AI_PROVIDERS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-sm text-gray-500">
                                Este es el proveedor que se utilizará cuando los usuarios generen tests.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Provider Configurations */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Configuración por Proveedor</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {AI_PROVIDERS.map((provider) => {
                            const providerKey = provider.id.toUpperCase();
                            const apiKeyField = `${providerKey}_API_KEY`;
                            const modelField = `${providerKey}_MODEL`;
                            const isConfigured = settings[apiKeyField] && String(settings[apiKeyField]).length > 5;
                            const isActive = activeProvider === provider.id;

                            return (
                                <div key={provider.id} className={`p-6 ${isActive ? 'bg-blue-50' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-base font-medium text-gray-900 flex items-center">
                                            {provider.name}
                                            {isActive && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Activo</span>}
                                            {isConfigured ? (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Configurado</span>
                                            ) : (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No configurado</span>
                                            )}
                                        </h4>
                                        <button
                                            onClick={() => handleTestConnection(provider.id)}
                                            disabled={testingConnection || !settings[apiKeyField]}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {testingConnection ? 'Probando...' : 'Probar conexión'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        {/* API Key */}
                                        <div className="sm:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700">API Key</label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <input
                                                    type={showKey[apiKeyField] ? "text" : "password"}
                                                    value={settings[apiKeyField] || ''}
                                                    onChange={(e) => handleChange(apiKeyField, e.target.value)}
                                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                                                    placeholder={`sk-...`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleShowKey(apiKeyField)}
                                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                                                >
                                                    {showKey[apiKeyField] ? 'Ocultar' : 'Mostrar'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Model Selector */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Modelo</label>
                                            <select
                                                value={settings[modelField] || provider.models[0]}
                                                onChange={(e) => handleChange(modelField, e.target.value)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                {provider.models.map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Test Result Message */}
                                    {testResult && testingConnection === false && (
                                        <div className={`mt-4 p-3 rounded-md text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {testResult.success ? (
                                                <div className="flex items-center">
                                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                    Conexión exitosa. Modelo detectado: {testResult.model}
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                                    Error: {testResult.message}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* General AI Settings */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Parámetros Generales</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">System Prompt</label>
                            <textarea
                                value={settings['AI_SYSTEM_PROMPT'] || ''}
                                onChange={(e) => handleChange('AI_SYSTEM_PROMPT', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                            <p className="mt-1 text-xs text-gray-500">Instrucciones base que definen el comportamiento y personalidad de la IA.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Creatividad (Temperature)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={settings['AI_CREATIVITY'] || 0.7}
                                onChange={(e) => handleChange('AI_CREATIVITY', parseFloat(e.target.value))}
                                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSection = (category: string) => {
        if (category === 'ai') return renderAISection();

        // Filtrar settings por categoría
        // Si no hay metadatos, asumimos 'general'
        const categorySettings = Object.entries(settings).filter(([key]) => {
            const meta = metadata[key];
            return (meta?.category || 'general') === category;
        });

        if (categorySettings.length === 0) {
            return <div className="text-gray-500 italic p-4">No hay configuraciones en esta sección.</div>;
        }

        return (
            <div className="space-y-6">
                {categorySettings.map(([key, value]) => {
                    const meta = metadata[key] || {};
                    return (
                        <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-2">
                                <label className="block text-sm font-medium text-gray-900 mr-2">
                                    {SETTING_LABELS[key] || key.replace(/_/g, ' ')}
                                </label>
                                {(meta.description || HELP_TEXTS[key]) && (
                                    <Tooltip content={HELP_TEXTS[key] || meta.description}>
                                        <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                                    </Tooltip>
                                )}
                            </div>
                            {renderInput(key, value, meta)}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        title="Volver"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                            {/* Global Status Indicator */}
                            {(() => {
                                const status = getGlobalStatus();
                                if (status === 'critical') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">🔴 Configuración Crítica</span>;
                                if (status === 'warning') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⚠️ Advertencias</span>;
                                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">🟢 Sistema Óptimo</span>;
                            })()}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Gestiona los parámetros globales de la aplicación
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={validateSettings}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <BeakerIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                        Probar configuración
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <ArrowDownOnSquareIcon className="-ml-1 mr-2 h-5 w-5" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Resultado de la Validación</h3>
                            <button onClick={() => setShowValidationModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Critical Errors */}
                            {validationResults.critical.length > 0 && (
                                <div>
                                    <h4 className="flex items-center text-red-800 font-medium mb-2">
                                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                        Errores Críticos ({validationResults.critical.length})
                                    </h4>
                                    <ul className="list-disc list-inside bg-red-50 rounded-md p-4 text-sm text-red-700 space-y-1">
                                        {validationResults.critical.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Warnings */}
                            {validationResults.warnings.length > 0 && (
                                <div>
                                    <h4 className="flex items-center text-yellow-800 font-medium mb-2">
                                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                        Advertencias ({validationResults.warnings.length})
                                    </h4>
                                    <ul className="list-disc list-inside bg-yellow-50 rounded-md p-4 text-sm text-yellow-700 space-y-1">
                                        {validationResults.warnings.map((warn, idx) => (
                                            <li key={idx}>{warn}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Correct */}
                            {validationResults.correct.length > 0 && (
                                <div>
                                    <h4 className="flex items-center text-green-800 font-medium mb-2">
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Configuraciones Correctas ({validationResults.correct.length})
                                    </h4>
                                    <ul className="list-disc list-inside bg-green-50 rounded-md p-4 text-sm text-green-700 space-y-1">
                                        {validationResults.correct.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {message.type === 'success' ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            ) : (
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { id: 'general', name: 'General', icon: Cog6ToothIcon },
                            { id: 'limits', name: 'Límites y Restricciones', icon: ShieldCheckIcon },
                            { id: 'ai', name: 'Configuración IA', icon: CpuChipIcon },
                            { id: 'roles', name: 'Roles y Permisos', icon: CircleStackIcon },
                            { id: 'maintenance', name: 'Mantenimiento', icon: ArrowPathIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <tab.icon className="mr-2 h-4 w-4" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 bg-gray-50 min-h-[500px]">
                    {activeTab === 'maintenance' ? (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones de Mantenimiento</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-md border border-yellow-100">
                                        <div>
                                            <h4 className="text-sm font-medium text-yellow-800">Limpiar Caché del Sistema</h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Fuerza la recarga de configuraciones en todas las instancias.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => fetchSettings()}
                                            className="px-3 py-2 bg-white border border-yellow-300 text-yellow-700 rounded-md text-sm hover:bg-yellow-50"
                                        >
                                            Limpiar Caché
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderSection(activeTab)
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
