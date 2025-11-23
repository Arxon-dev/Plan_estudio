import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, PhotoIcon, InformationCircleIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../common/Tooltip';

interface ThemeOption {
    id: string;
    themeId: number;
    name: string;
    block: string;
    part?: number;
}

interface QuestionFormData {
    id?: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    themeId: number;
    themePart?: number;
    tags: string[];
}

interface QuestionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: QuestionFormData) => Promise<void>;
    initialData?: QuestionFormData | null;
    themes: ThemeOption[];
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ isOpen, onClose, onSave, initialData, themes }) => {
    const [formData, setFormData] = useState<QuestionFormData>({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'MEDIUM',
        themeId: themes[0]?.themeId || 1,
        tags: []
    });
    const [selectedThemeValue, setSelectedThemeValue] = useState<string>(themes[0]?.id || '1');
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Find the matching theme option ID
            const matchingTheme = themes.find(t =>
                t.themeId === initialData.themeId &&
                (initialData.themePart ? t.part === initialData.themePart : !t.part)
            );
            if (matchingTheme) {
                setSelectedThemeValue(matchingTheme.id);
            }
        } else {
            // Reset form
            setFormData({
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: '',
                difficulty: 'MEDIUM',
                themeId: themes[0]?.themeId || 1,
                tags: []
            });
            setSelectedThemeValue(themes[0]?.id || '1');
        }
        setErrors({});
        setActiveTab('edit');
    }, [initialData, isOpen, themes]);

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedThemeValue(value);
        const theme = themes.find(t => t.id === value);
        if (theme) {
            setFormData(prev => ({
                ...prev,
                themeId: theme.themeId,
                themePart: theme.part
            }));
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        if (formData.options.length < 4) {
            setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
        }
    };

    const removeOption = (index: number) => {
        if (formData.options.length > 2) {
            const newOptions = formData.options.filter((_, i) => i !== index);
            let newCorrect = formData.correctAnswer;
            if (index === formData.correctAnswer) {
                newCorrect = 0; // Reset if deleted
            } else if (index < formData.correctAnswer) {
                newCorrect--; // Shift down
            }
            setFormData(prev => ({ ...prev, options: newOptions, correctAnswer: newCorrect }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.question.trim()) newErrors.question = 'El enunciado es obligatorio';
        else if (formData.question.length < 10) newErrors.question = 'El enunciado es muy corto';

        if (formData.options.some(opt => !opt.trim())) {
            newErrors.options = 'Todas las opciones deben tener texto';
        }

        if (new Set(formData.options).size !== formData.options.length) {
            newErrors.options = 'Las opciones deben ser diferentes entre sí';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Editar Pregunta' : 'Nueva Pregunta'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'edit'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('edit')}
                    >
                        <div className="flex items-center gap-2">
                            <PencilIcon className="h-4 w-4" />
                            Edición
                        </div>
                    </button>
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('preview')}
                    >
                        <div className="flex items-center gap-2">
                            <EyeIcon className="h-4 w-4" />
                            Vista Previa
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'edit' ? (
                        <div className="space-y-6">
                            {/* Bloque y Tema */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bloque y Tema <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedThemeValue}
                                    onChange={handleThemeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <optgroup label="Organización">
                                        {themes.filter(t => t.block === 'Organización').map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Jurídico-Social">
                                        {themes.filter(t => t.block === 'Jurídico-Social').map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Seguridad Nacional">
                                        {themes.filter(t => t.block === 'Seguridad Nacional').map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Asocia la pregunta a un tema específico</p>
                            </div>

                            {/* Enunciado */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enunciado <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-xs ${formData.question.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {formData.question.length}/200
                                    </span>
                                </div>
                                <textarea
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.question ? 'border-red-500' : 'border-gray-300'}`}
                                    rows={3}
                                    placeholder="¿Cuál es el artículo que reconoce el derecho a la educación?"
                                />
                                {errors.question && <p className="text-xs text-red-500 mt-1">{errors.question}</p>}
                            </div>

                            {/* Imagen (Disabled) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    Imagen
                                    <Tooltip content="Funcionalidad próximamente disponible">
                                        <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                    </Tooltip>
                                </label>
                                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
                                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Arrastra una imagen o haz clic para subir</p>
                                        <p className="text-xs text-gray-400">Máx 2MB, JPG/PNG</p>
                                    </div>
                                </div>
                            </div>

                            {/* Respuestas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Respuestas <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-3">
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={formData.correctAnswer === index}
                                                onChange={() => setFormData({ ...formData, correctAnswer: index })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                title="Marcar como correcta"
                                            />
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={e => handleOptionChange(index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder={`Opción ${index + 1}`}
                                            />
                                            {formData.options.length > 2 && (
                                                <button
                                                    onClick={() => removeOption(index)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                    title="Eliminar opción"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {formData.options.length < 4 && (
                                    <button
                                        onClick={addOption}
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <PlusIcon className="h-4 w-4" /> Añadir opción
                                    </button>
                                )}
                                {errors.options && <p className="text-xs text-red-500 mt-1">{errors.options}</p>}
                                <p className="text-xs text-gray-500 mt-2">Mínimo 2, máximo 4 opciones. Marca la correcta.</p>
                            </div>

                            {/* Dificultad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dificultad
                                </label>
                                <div className="flex gap-4">
                                    {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                                        <label key={diff} className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-colors ${formData.difficulty === diff
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="difficulty"
                                                value={diff}
                                                checked={formData.difficulty === diff}
                                                onChange={() => setFormData({ ...formData, difficulty: diff as any })}
                                                className="hidden"
                                            />
                                            <span className="font-medium">
                                                {diff === 'EASY' ? 'Fácil' : diff === 'MEDIUM' ? 'Media' : 'Difícil'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Fácil: conceptos básicos | Media: comprensión | Difícil: análisis</p>
                            </div>

                            {/* Explicación */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Explicación (Opcional)
                                </label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Explica por qué la respuesta correcta es la que es..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Ayuda al aprendizaje del alumno al revisar el test.</p>
                            </div>
                        </div>
                    ) : (
                        // PREVIEW TAB
                        <div className="flex justify-center items-center h-full bg-gray-100 rounded-lg p-8">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${formData.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                            formData.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {formData.difficulty === 'EASY' ? 'FÁCIL' : formData.difficulty === 'MEDIUM' ? 'MEDIA' : 'DIFÍCIL'}
                                    </span>
                                    <span className="text-xs text-gray-400">ID: PREVIEW</span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    {formData.question || <span className="text-gray-300 italic">Escribe un enunciado...</span>}
                                </h3>

                                <div className="space-y-3">
                                    {formData.options.map((opt, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border flex items-center gap-3 ${idx === formData.correctAnswer
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-white border-gray-200'
                                            }`}>
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${idx === formData.correctAnswer
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-gray-300 text-gray-500'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={opt ? 'text-gray-700' : 'text-gray-300 italic'}>
                                                {opt || `Opción ${idx + 1}`}
                                            </span>
                                            {idx === formData.correctAnswer && (
                                                <span className="ml-auto text-xs font-bold text-green-600">CORRECTA</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {formData.explanation && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                                            <InformationCircleIcon className="h-4 w-4" /> Explicación
                                        </h4>
                                        <p className="text-sm text-blue-700">{formData.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                    >
                        {loading ? 'Guardando...' : 'Guardar Pregunta'}
                    </button>
                </div>
            </div>
        </div>
    );
};
