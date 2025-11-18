import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

interface Theme {
  id: number;
  block: string;
  themeNumber: number;
  title: string;
  content: string | null;
  parts: number;
  estimatedHours: number;
}

export const Themes: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const response = await apiClient.get('/themes');
      setThemes(response.data.themes);
    } catch (error) {
      toast.error('Error al cargar los temas');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredThemes = () => {
    if (filterBlock === 'ALL') return themes;
    return themes.filter((theme) => theme.block === filterBlock);
  };

  const getBlockName = (block: string) => {
    const names: { [key: string]: string } = {
      ORGANIZACION: 'Organización',
      JURIDICO_SOCIAL: 'Jurídico-Social',
      SEGURIDAD_NACIONAL: 'Seguridad Nacional',
    };
    return names[block] || block;
  };

  const getBlockColor = (block: string) => {
    const colors: { [key: string]: string } = {
      ORGANIZACION: 'bg-blue-100 text-blue-800 border-blue-200',
      JURIDICO_SOCIAL: 'bg-purple-100 text-purple-800 border-purple-200',
      SEGURIDAD_NACIONAL: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[block] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const groupThemesByBlock = () => {
    const filtered = getFilteredThemes();
    const grouped: { [key: string]: Theme[] } = {};

    filtered.forEach((theme) => {
      if (!grouped[theme.block]) {
        grouped[theme.block] = [];
      }
      grouped[theme.block].push(theme);
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const groupedThemes = groupThemesByBlock();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Inicio
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Temario Permanencia</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Buttons */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterBlock('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBlock === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos los Bloques ({themes.length})
            </button>
            <button
              onClick={() => setFilterBlock('ORGANIZACION')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBlock === 'ORGANIZACION'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Organización ({themes.filter((t) => t.block === 'ORGANIZACION').length})
            </button>
            <button
              onClick={() => setFilterBlock('JURIDICO_SOCIAL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBlock === 'JURIDICO_SOCIAL'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚖️ Jurídico-Social ({themes.filter((t) => t.block === 'JURIDICO_SOCIAL').length})
            </button>
            <button
              onClick={() => setFilterBlock('SEGURIDAD_NACIONAL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBlock === 'SEGURIDAD_NACIONAL'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🛡️ Seguridad Nacional ({themes.filter((t) => t.block === 'SEGURIDAD_NACIONAL').length})
            </button>
          </div>
        </div>

        {/* Themes List */}
        <div className="space-y-8">
          {Object.entries(groupedThemes).map(([block, blockThemes]) => (
            <div key={block}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm ${getBlockColor(block)}`}>
                  {getBlockName(block)}
                </span>
                <span className="text-gray-500 text-sm">({blockThemes.length} temas)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {blockThemes
                  .sort((a, b) => a.themeNumber - b.themeNumber)
                  .map((theme) => (
                    <div
                      key={theme.id}
                      className={`card cursor-pointer transition-all hover:shadow-lg ${
                        selectedTheme?.id === theme.id ? 'ring-2 ring-primary-500' : ''
                      }`}
                      onClick={() => setSelectedTheme(selectedTheme?.id === theme.id ? null : theme)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getBlockColor(theme.block)}`}>
                              Tema {theme.themeNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              ⏱️ {theme.estimatedHours}h • {theme.parts} {theme.parts === 1 ? 'parte' : 'partes'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{theme.title}</h3>

                          {selectedTheme?.id === theme.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {theme.content ? (
                                <div className="prose prose-sm max-w-none">
                                  <p className="text-gray-700 whitespace-pre-wrap">{theme.content}</p>
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                  <p className="text-gray-500">
                                    📚 El contenido de este tema estará disponible próximamente
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Mientras tanto, puedes consultar el temario oficial
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <button className="text-gray-400 hover:text-gray-600">
                          {selectedTheme?.id === theme.id ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {Object.keys(groupedThemes).length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No hay temas disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
};
