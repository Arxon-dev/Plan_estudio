import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  questions: Array<{
    id: number;
    question: string;
    difficulty: string;
  }>;
}

interface PreviewData {
  valid: boolean;
  questionCount: number;
  questions: Array<{
    question: string;
    optionsCount: number;
    hasExplanation: boolean;
    difficulty: string;
    tags: string[];
  }>;
  errors: string[];
}

const ImportQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [themeId, setThemeId] = useState<string>('1');
  const [importType, setImportType] = useState<'single' | 'mixed'>('single');
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.gift') && !droppedFile.name.endsWith('.txt')) {
        setError('Por favor sube un archivo válido (.gift o .txt)');
        return;
      }

      setFile(droppedFile);
      setError('');
      setPreview(null);
      setResult(null);

      // Leer contenido del archivo
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setPreview(null);
      setResult(null);

      // Leer contenido del archivo
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handlePreview = async () => {
    if (!fileContent) {
      setError('Primero selecciona un archivo GIFT');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<PreviewData>(
        'http://localhost:3000/api/admin/questions/preview-gift',
        { giftContent: fileContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPreview(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al previsualizar preguntas');
      console.error('Error preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!fileContent) {
      setError('Primero selecciona un archivo GIFT');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');

      let endpoint = '';
      let payload: any = { giftContent: fileContent };

      if (importType === 'single') {
        endpoint = 'http://localhost:3000/api/admin/questions/import-gift';
        payload.themeId = parseInt(themeId);
        payload.skipDuplicates = skipDuplicates;
        payload.overwriteExisting = overwriteExisting;
      } else {
        endpoint = 'http://localhost:3000/api/admin/questions/import-gift-mixed';
      }

      const response = await axios.post<ImportResult>(
        endpoint,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setResult(response.data);
      setPreview(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al importar preguntas');
      console.error('Error import:', err);
      if (err.response?.data?.errors) {
        console.error('Errores:', err.response.data.errors);
      }
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
                📚 Importar Preguntas GIFT
              </h1>
              <p className="text-gray-600">
                Sube archivos .gift para importar preguntas de test automáticamente
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
          <div className="space-y-4">
            {/* Tipo de importación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de importación
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="single"
                    checked={importType === 'single'}
                    onChange={(e) => setImportType(e.target.value as 'single')}
                    className="mr-2"
                  />
                  <span>Un solo tema</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="mixed"
                    checked={importType === 'mixed'}
                    onChange={(e) => setImportType(e.target.value as 'mixed')}
                    className="mr-2"
                  />
                  <span>Preguntas mixtas (simulacros)</span>
                </label>
              </div>
            </div>

            {/* Tema ID (solo para single) */}
            {importType === 'single' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Tema
                </label>
                <input
                  type="number"
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1 (Constitución Española)"
                  min="1"
                />

                {/* Tabla de IDs de Temas */}
                <div className="mt-3 bg-blue-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-xs font-semibold text-blue-800 mb-2">🎯 IDs de Temas Principales:</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">1</span> - Constitución Española 1978
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">2</span> - Ley Orgánica 5/2005, Defensa Nacional
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">3</span> - Ley 40/2015, Régimen Jurídico Sector Público
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">4</span> - RD 205/2024, Ministerio de Defensa
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">5</span> - RD 521/2020, Organización Básica FAS
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">6</span> - Instrucciones EMAD, ET, ARMADA y EA
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">7</span> - Ley 8/2006 Tropa / Ley 39/2007 Carrera Militar
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">8</span> - RD 96/2009 Reales Ordenanzas FAS
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">9</span> - Ley Orgánica 9/2011, Derechos y Deberes FAS
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">10</span> - Ley Orgánica 8/2014, Régimen Disciplinario FAS
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">11</span> - RD 176/2014, Iniciativas y Quejas
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">12</span> - Ley Orgánica 3/2007 Igualdad Efectiva
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">13</span> - Observatorio militar para la igualdad
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">14</span> - Ley 39/2015 Procedimiento Administrativo
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">15</span> - Ley 36/2015 Seguridad Nacional
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">16</span> - PDC-01(B) Doctrina empleo FAS
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">17</span> - ONU (Naciones Unidas)
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">18</span> - OTAN (Tratado Atlántico Norte)
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">19</span> - OSCE (Seguridad y Cooperación Europa)
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">20</span> - UE (Unión Europea)
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="font-bold text-blue-600">21</span> - Misiones Internacionales
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 italic">
                    📝 Lista completa en el manual (MANUAL_IMPORTADOR_GIFT.md)
                  </p>
                </div>

                {/* Información sobre Partes */}
                <div className="mt-3 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-800 mb-2">⚠️ Temas con Múltiples Partes:</p>
                  <p className="text-xs text-yellow-700 mb-2">
                    El sistema detecta automáticamente la parte por palabras clave o etiquetas (ej: # PARTE 1).
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-white rounded px-2 py-1 border border-yellow-100">
                      <span className="font-bold text-blue-600">ID 6</span>:
                      <ul className="list-disc list-inside ml-2 text-gray-600">
                        <li>Parte 1: EMAD (Instr. 55/2021)</li>
                        <li>Parte 2: ET (Instr. 14/2021)</li>
                        <li>Parte 3: ARMADA (Instr. 15/2021)</li>
                        <li>Parte 4: EA (Instr. 6/2025)</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded px-2 py-1 border border-yellow-100">
                      <span className="font-bold text-blue-600">ID 7</span>:
                      <ul className="list-disc list-inside ml-2 text-gray-600">
                        <li>Parte 1: Ley 8/2006 (Tropa)</li>
                        <li>Parte 2: Ley 39/2007 (Carrera)</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded px-2 py-1 border border-yellow-100">
                      <span className="font-bold text-blue-600">ID 15</span>:
                      <ul className="list-disc list-inside ml-2 text-gray-600">
                        <li>Parte 1: Ley 36/2015 (Seguridad)</li>
                        <li>Parte 2: RD 1150/2021 (Estrategia)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opciones (solo para single) */}
            {importType === 'single' && (
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Saltar preguntas duplicadas
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Sobrescribir preguntas existentes
                  </span>
                </label>
              </div>
            )}

            {/* Selector de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo GIFT
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".gift,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 w-full justify-center h-full"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className={`w-12 h-12 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">
                        {file ? (
                          <span className="text-blue-600 font-medium">
                            {file.name} ({Math.round(file.size / 1024)} KB)
                          </span>
                        ) : (
                          <>
                            <span className="text-blue-600 font-medium">
                              Haz clic para subir
                            </span>{' '}
                            o arrastra el archivo aquí
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: .gift, .txt
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? '🔄 Cargando...' : '👁️ Vista Previa'}
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? '🔄 Importando...' : '💾 Importar Ahora'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              👁️ Vista Previa
            </h2>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Formato válido</p>
                  <p className="text-lg font-semibold">
                    {preview.valid ? '✅ Sí' : '❌ No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preguntas detectadas</p>
                  <p className="text-lg font-semibold">{preview.questionCount}</p>
                </div>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">Errores</h3>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {preview.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {preview.questions.map((q, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">
                        {i + 1}. {q.question}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>📝 {q.optionsCount} opciones</span>
                        <span>💡 {q.hasExplanation ? 'Con' : 'Sin'} explicación</span>
                        <span className={`font-semibold ${q.difficulty === 'EASY' ? 'text-green-600' :
                          q.difficulty === 'HARD' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      {q.tags.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {q.tags.map((tag, j) => (
                            <span
                              key={j}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🎉</span>
              <div>
                <h2 className="text-2xl font-bold text-green-600">
                  ¡Importación Exitosa!
                </h2>
                <p className="text-gray-600">
                  {result.imported} preguntas importadas, {result.skipped} omitidas
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Advertencias
                </h3>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {result.questions.map((q, i) => (
                <div key={i} className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">ID {q.id}:</span> {q.question}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${q.difficulty === 'EASY' ? 'bg-green-200 text-green-800' :
                      q.difficulty === 'HARD' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setFileContent('');
                  setResult(null);
                  setPreview(null);
                  setError('');
                }}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                ✨ Importar Más Preguntas
              </button>
              <button
                onClick={() => navigate('/tests')}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                📝 Ver Tests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportQuestions;
