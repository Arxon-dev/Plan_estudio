import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { QuestionFormModal } from '../components/admin/QuestionFormModal';
import { PencilIcon, DocumentDuplicateIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Question {
    id: number;
    question: string;
    difficulty: string;
    optionsCount: number;
    hasExplanation: boolean;
    createdAt: string;
}

interface QuestionsResponse {
    count: number;
    themeId: number;
    questions: Question[];
}

// Definición de temas base
const THEMES_BASE = [
    // BLOQUE 1 - ORGANIZACIÓN
    { id: 1, name: 'Constitución Española 1978 (Títulos III, IV, V, VI, VIII)', block: 'Organización', parts: 1 },
    { id: 2, name: 'Ley Orgánica 5/2005 Defensa Nacional', block: 'Organización', parts: 1 },
    { id: 3, name: 'Ley 40/2015 Régimen Jurídico Sector Público', block: 'Organización', parts: 1 },
    { id: 4, name: 'Real Decreto 205/2024 Ministerio de Defensa', block: 'Organización', parts: 1 },
    { id: 5, name: 'RD 521/2020 Organización Básica FAS', block: 'Organización', parts: 1 },
    {
        id: 6,
        name: 'Instrucciones EMAD, ET, ARMADA y EA',
        block: 'Organización',
        parts: 4,
        partNames: [
            'Instrucción 55/2021, EMAD',
            'Instrucción 14/2021, ET',
            'Instrucción 15/2021, ARMADA',
            'Instrucción 6/2025, EA'
        ]
    },

    // BLOQUE 2 - JURÍDICO-SOCIAL
    {
        id: 7,
        name: 'Ley 8/2006 Tropa / Ley 39/2007 Carrera Militar',
        block: 'Jurídico-Social',
        parts: 2,
        partNames: [
            'Ley 8/2006, Tropa y Marinería',
            'Ley 39/2007 de la Carrera Militar'
        ]
    },
    { id: 8, name: 'RD 96/2009 Reales Ordenanzas FAS', block: 'Jurídico-Social', parts: 1 },
    { id: 9, name: 'LO 9/2011 Derechos y Deberes FAS', block: 'Jurídico-Social', parts: 1 },
    { id: 10, name: 'LO 8/2014 Régimen Disciplinario FAS', block: 'Jurídico-Social', parts: 1 },
    { id: 11, name: 'RD 176/2014 Iniciativas y Quejas', block: 'Jurídico-Social', parts: 1 },
    { id: 12, name: 'LO 3/2007 Igualdad Efectiva Mujeres-Hombres', block: 'Jurídico-Social', parts: 1 },
    { id: 13, name: 'Observatorio Militar Igualdad FAS', block: 'Jurídico-Social', parts: 1 },
    { id: 14, name: 'Ley 39/2015 Procedimiento Administrativo Común', block: 'Jurídico-Social', parts: 1 },

    // BLOQUE 3 - SEGURIDAD NACIONAL
    {
        id: 15,
        name: 'Ley 36/2015 Seguridad / RD 1150/2021 Estrategia',
        block: 'Seguridad Nacional',
        parts: 2,
        partNames: [
            'Ley 36/2015, Seguridad Nacional',
            'Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021'
        ]
    },
    { id: 16, name: 'PDC-01(B) Doctrina Empleo FAS', block: 'Seguridad Nacional', parts: 1 },
    { id: 17, name: 'Organización de las Naciones Unidas (ONU)', block: 'Seguridad Nacional', parts: 1 },
    { id: 18, name: 'Organización del Tratado Atlántico Norte (OTAN)', block: 'Seguridad Nacional', parts: 1 },
    { id: 19, name: 'Organización Seguridad y Cooperación Europa (OSCE)', block: 'Seguridad Nacional', parts: 1 },
    { id: 20, name: 'Unión Europea (UE)', block: 'Seguridad Nacional', parts: 1 },
    { id: 21, name: 'España y Misiones Internacionales', block: 'Seguridad Nacional', parts: 1 },
];

// Helpers
const getBlockNumber = (block: string): number => {
    if (block === 'Organización') return 1;
    if (block === 'Jurídico-Social') return 2;
    if (block === 'Seguridad Nacional') return 3;
    return 0;
};

const getThemeNumber = (id: number): number => {
    const theme = THEMES_BASE.find(t => t.id === id);
    if (!theme) return id;

    // Calcular número de tema dentro del bloque
    const themesInBlock = THEMES_BASE.filter(t => t.block === theme.block);
    const index = themesInBlock.findIndex(t => t.id === id);
    return index + 1;
};

// Expandir temas con partes en opciones individuales
const expandThemes = () => {
    const expanded: Array<{
        id: string; // Formato: "6" o "6-1", "6-2", etc.
        themeId: number; // ID real del tema en BD
        name: string;
        block: string;
        part?: number; // Número de parte (1, 2, 3, 4)
    }> = [];

    THEMES_BASE.forEach(theme => {
        if (theme.parts === 1) {
            // Tema sin partes, añadir directamente
            expanded.push({
                id: theme.id.toString(),
                themeId: theme.id,
                name: `B${getBlockNumber(theme.block)}-T${getThemeNumber(theme.id)}: ${theme.name}`,
                block: theme.block
            });
        } else {
            // Tema con múltiples partes, expandir cada parte
            for (let partNum = 1; partNum <= theme.parts; partNum++) {
                const partName = theme.partNames ? theme.partNames[partNum - 1] : `Parte ${partNum}`;
                expanded.push({
                    id: `${theme.id}-${partNum}`,
                    themeId: theme.id,
                    name: `B${getBlockNumber(theme.block)}-T${getThemeNumber(theme.id)}.${partNum}: ${partName}`,
                    block: theme.block,
                    part: partNum
                });
            }
        }
    });

    return expanded;
};

// Lista completa de temas expandidos
const THEMES = expandThemes();

export const ManageQuestions: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [themeId, setThemeId] = useState<number>(1);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

    const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

    // Modal de Creación/Edición
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null); // Usar tipo adecuado si se exporta

    useEffect(() => {
        console.log('🔍 ManageQuestions - Usuario:', user);
        console.log('🔍 ManageQuestions - isAdmin:', user?.isAdmin);
        console.log('🔍 ManageQuestions - localStorage user:', localStorage.getItem('user'));

        if (user?.isAdmin) {
            console.log('✅ Usuario es admin, cargando preguntas...');
            loadQuestions();
        } else {
            console.log('❌ Usuario NO es admin o user es null');
            toast.error('Acceso denegado. Solo administradores.');
            navigate('/dashboard');
        }
    }, [themeId, user, navigate]);

    useEffect(() => {
        // Filtrar preguntas por término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredQuestions(questions);
        } else {
            const filtered = questions.filter(q =>
                q.question.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredQuestions(filtered);
        }
    }, [searchTerm, questions]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<QuestionsResponse>(
                `${import.meta.env.VITE_API_URL}/admin/questions/${themeId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setQuestions(response.data.questions);
            setFilteredQuestions(response.data.questions);
            setSelectedIds([]);
        } catch (error: any) {
            console.error('Error al cargar preguntas:', error);
            toast.error(error.response?.data?.message || 'Error al cargar preguntas');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredQuestions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredQuestions.map(q => q.id));
        }
    };

    const handleSelectQuestion = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(qId => qId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            toast.error('Selecciona al menos una pregunta');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/questions/delete-bulk`,
                { questionIds: selectedIds },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(`${selectedIds.length} preguntas eliminadas exitosamente`);
            setShowDeleteSelectedModal(false);
            loadQuestions();
        } catch (error: any) {
            console.error('Error al eliminar preguntas:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar preguntas');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllFromTheme = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/questions/theme/${themeId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(response.data.message);
            setShowDeleteAllModal(false);
            loadQuestions();
        } catch (error: any) {
            console.error('Error al eliminar preguntas del tema:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar preguntas del tema');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = () => {
        setEditingQuestion(null);
        setShowQuestionModal(true);
    };

    const handleEditQuestion = async (questionId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/tests/question/${questionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Mapear respuesta al formato del formulario
            const q = response.data;
            setEditingQuestion({
                id: q.id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                difficulty: q.difficulty,
                themeId: themeId, // Asumimos el tema actual o lo sacamos de la respuesta si viniera
                tags: [] // Si vinieran tags, mapearlos
            });
            setShowQuestionModal(true);
        } catch (error) {
            toast.error('Error al cargar detalles de la pregunta');
        }
    };

    const handleDuplicateQuestion = async (questionId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/tests/question/${questionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const q = response.data;
            setEditingQuestion({
                ...q,
                id: undefined, // Es nueva
                question: `(Copia) ${q.question}`,
                themeId: themeId
            });
            setShowQuestionModal(true);
        } catch (error) {
            toast.error('Error al duplicar pregunta');
        }
    };

    const handleSaveQuestion = async (formData: any) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (formData.id) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/admin/questions/${formData.id}`,
                    formData,
                    { headers }
                );
                toast.success('Pregunta actualizada');
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/admin/questions`,
                    formData,
                    { headers }
                );
                toast.success('Pregunta creada');
            }
            setShowQuestionModal(false);
            loadQuestions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar pregunta');
            throw error;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY':
                return 'bg-green-100 text-green-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800';
            case 'HARD':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY':
                return 'Fácil';
            case 'MEDIUM':
                return 'Media';
            case 'HARD':
                return 'Difícil';
            default:
                return difficulty;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Gestionar Preguntas" showBack={true} backPath="/admin" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Selector de Tema y Búsqueda */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selector de Tema */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Tema / Parte
                            </label>
                            <select
                                value={themeId}
                                onChange={(e) => setThemeId(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <optgroup label="📚 BLOQUE 1 - ORGANIZACIÓN">
                                    {THEMES.filter(t => t.block === 'Organización').map((theme) => (
                                        <option key={theme.id} value={theme.themeId}>
                                            {theme.name}
                                        </option>
                                    ))}
                                </optgroup>

                                <optgroup label="⚖️ BLOQUE 2 - JURÍDICO-SOCIAL">
                                    {THEMES.filter(t => t.block === 'Jurídico-Social').map((theme) => (
                                        <option key={theme.id} value={theme.themeId}>
                                            {theme.name}
                                        </option>
                                    ))}
                                </optgroup>

                                <optgroup label="🛡️ BLOQUE 3 - SEGURIDAD NACIONAL">
                                    {THEMES.filter(t => t.block === 'Seguridad Nacional').map((theme) => (
                                        <option key={theme.id} value={theme.themeId}>
                                            {theme.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {/* Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar Pregunta
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por texto de la pregunta..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Información del tema seleccionado */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            📊 Mostrando {filteredQuestions.length} de {questions.length} preguntas
                            {searchTerm && ` (filtradas por: "${searchTerm}")`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleSelectAll}
                        disabled={filteredQuestions.length === 0}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {selectedIds.length === filteredQuestions.length ? '❌ Deseleccionar' : '✅ Seleccionar Todo'}
                    </button>

                    <button
                        onClick={() => setShowDeleteSelectedModal(true)}
                        disabled={selectedIds.length === 0 || loading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        🗑️ Eliminar ({selectedIds.length})
                    </button>

                    <button
                        onClick={() => setShowDeleteAllModal(true)}
                        disabled={questions.length === 0 || loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ⚠️ Eliminar Todo
                    </button>
                </div>

                <button
                    onClick={handleCreateQuestion}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nueva Pregunta
                </button>
            </div>

            {/* Lista de Preguntas */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg">
                        {questions.length === 0
                            ? '📝 No hay preguntas en este tema todavía'
                            : '🔍 No se encontraron preguntas con ese término de búsqueda'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQuestions.map((question) => (
                        <div
                            key={question.id}
                            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all group ${selectedIds.includes(question.id)
                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                : 'hover:shadow-lg'
                                }`}
                            onClick={() => handleSelectQuestion(question.id)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(question.id)}
                                    onChange={() => handleSelectQuestion(question.id)}
                                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                />

                                {/* Contenido */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-medium text-gray-900 flex-1">
                                            {question.question}
                                        </h3>
                                        <span
                                            className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                                question.difficulty
                                            )}`}
                                        >
                                            {getDifficultyLabel(question.difficulty)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>📝 {question.optionsCount} opciones</span>
                                        <span>
                                            {question.hasExplanation ? '✅ Con explicación' : '❌ Sin explicación'}
                                        </span>
                                        <span>🕒 {new Date(question.createdAt).toLocaleDateString('es-ES')}</span>
                                    </div>
                                </div>

                                {/* Acciones Individuales */}
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleEditQuestion(question.id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="Editar"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDuplicateQuestion(question.id)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                                        title="Duplicar"
                                    >
                                        <DocumentDuplicateIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Modal de Pregunta */}
            <QuestionFormModal
                isOpen={showQuestionModal}
                onClose={() => setShowQuestionModal(false)}
                onSave={handleSaveQuestion}
                initialData={editingQuestion}
                themes={THEMES}
            />

            {/* Modal: Eliminar Seleccionadas */}
            {
                showDeleteSelectedModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Confirmar Eliminación</h3>
                            <p className="text-gray-700 mb-6">
                                ¿Estás seguro de que deseas eliminar <strong>{selectedIds.length} preguntas seleccionadas</strong>?
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteSelectedModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal: Eliminar Todas del Tema */}
            {
                showDeleteAllModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">🚨 Confirmar Eliminación Masiva</h3>
                            <p className="text-gray-700 mb-6">
                                ¿Estás seguro de que deseas eliminar <strong>TODAS las {questions.length} preguntas</strong> de este tema?
                                <br />
                                <br />
                                <span className="text-red-600 font-semibold">⚠️ Esta acción es IRREVERSIBLE</span>
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteAllModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteAllFromTheme}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Eliminando...' : 'Eliminar Todas'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ManageQuestions;
