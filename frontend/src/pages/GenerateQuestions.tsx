import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface GeneratedQuestion {
    id: number;
    question: string;
    difficulty: number;
    source: string;
}

const GenerateQuestions: React.FC = () => {
    const navigate = useNavigate();
    const [themeId, setThemeId] = useState<string>('2');
    const [count, setCount] = useState<number>(1);
    const [difficulty, setDifficulty] = useState<string>('MEDIUM');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<GeneratedQuestion[]>([]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setResult([]);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/api/admin/tests/generate',
                {
                    themeId: parseInt(themeId),
                    count,
                    difficulty
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setResult(response.data.questions);
        } catch (err: any) {
            console.error('Error generating questions:', err);
            setError(err.response?.data?.message || 'Error al generar preguntas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                🤖 Generador de Preguntas con IA
                            </h1>
                            <p className="text-gray-600">
                                Crea nuevas preguntas automáticamente usando GLM-4
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                        >
                            ← Volver
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Theme ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID del Tema
                            </label>
                            <input
                                type="number"
                                value={themeId}
                                onChange={(e) => setThemeId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="1"
                            />
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dificultad
                            </label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="EASY">Fácil</option>
                                <option value="MEDIUM">Media</option>
                                <option value="HARD">Difícil</option>
                            </select>
                        </div>

                        {/* Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cantidad (Máx 5)
                            </label>
                            <select
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={1}>1 Pregunta</option>
                                <option value={2}>2 Preguntas</option>
                                <option value={3}>3 Preguntas</option>
                                <option value={5}>5 Preguntas</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generando...
                                </span>
                            ) : (
                                '✨ Generar Preguntas'
                            )}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">❌</span>
                            <div>
                                <h3 className="font-semibold text-red-800">Error</h3>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>🎉</span> Preguntas Generadas ({result.length})
                        </h2>
                        <div className="space-y-4">
                            {result.map((q, i) => (
                                <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded mb-2">
                                                ID: {q.id}
                                            </span>
                                            <p className="font-medium text-gray-800">{q.question}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {q.difficulty === 2 ? 'EASY' : q.difficulty === 8 ? 'HARD' : 'MEDIUM'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateQuestions;
