import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import apiClient from '../services/api';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface Theme {
  id: number;
  blockId: number;
  themeNumber: number;
  title: string;
  content: string | null;
  parts: number;
  estimatedHours: number;
}

interface Block {
  id: number;
  code: string;
  name: string;
  themes: Theme[];
}

export const Themes: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [filterBlockId, setFilterBlockId] = useState<number | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSyllabus();
  }, []);

  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      doneBtnText: 'Entendido',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      steps: [
        {
          element: '#filter-buttons',
          popover: {
            title: 'Explora por Bloques',
            description: 'Filtra los temas por bloques para enfocar tu estudio.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#themes-list',
          popover: {
            title: 'Temario Completo',
            description: 'Aquí encontrarás todos los temas. Haz clic en uno para ver su contenido detallado.',
            side: 'top',
            align: 'start'
          }
        }
      ]
    });

    const hasSeenTutorial = localStorage.getItem(`onboarding:themes:v1:${user?.id}`);

    if (!hasSeenTutorial && !isLoading && blocks.length > 0) {
      setTimeout(() => {
        driverObj.drive();
        localStorage.setItem(`onboarding:themes:v1:${user?.id}`, 'true');
      }, 1000);
    }
  }, [isLoading, blocks.length, user?.id]);

  const loadSyllabus = async () => {
    try {
      // We use the admin endpoint for now as it returns the nested structure we need
      // Ideally we should have a public/student endpoint for this
      const response = await apiClient.get('/admin/syllabus');
      setBlocks(response.data);
    } catch (error) {
      toast.error('Error al cargar el temario');
    } finally {
      setIsLoading(false);
    }
  };

  const getBlockColor = (code: string) => {
    const colors: { [key: string]: string } = {
      ORGANIZACION: 'bg-blue-100 text-blue-800 border-blue-200',
      JURIDICO_SOCIAL: 'bg-purple-100 text-purple-800 border-purple-200',
      SEGURIDAD_NACIONAL: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[code] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getButtonColor = (code: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-200 text-gray-700 hover:bg-gray-300';

    const colors: { [key: string]: string } = {
      ORGANIZACION: 'bg-blue-600 text-white',
      JURIDICO_SOCIAL: 'bg-purple-600 text-white',
      SEGURIDAD_NACIONAL: 'bg-orange-600 text-white',
    };
    return colors[code] || 'bg-gray-800 text-white';
  };

  const filteredBlocks = filterBlockId === 'ALL'
    ? blocks
    : blocks.filter(b => b.id === filterBlockId);

  const totalThemes = blocks.reduce((acc, block) => acc + block.themes.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title="Temario Permanencia" showBack={true} backPath="/dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Buttons */}
        <div id="filter-buttons" className="card mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterBlockId('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterBlockId === 'ALL'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Todos los Bloques ({totalThemes})
            </button>

            {blocks.map(block => (
              <button
                key={block.id}
                onClick={() => setFilterBlockId(block.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonColor(block.code, filterBlockId === block.id)}`}
              >
                {block.name} ({block.themes.length})
              </button>
            ))}
          </div>
        </div>

        {/* Themes List */}
        <div id="themes-list" className="space-y-8">
          {filteredBlocks.map((block) => (
            <div key={block.id}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm ${getBlockColor(block.code)}`}>
                  {block.name}
                </span>
                <span className="text-gray-500 text-sm">({block.themes.length} temas)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {block.themes.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No hay temas en este bloque.</p>
                ) : (
                  block.themes
                    .sort((a, b) => a.themeNumber - b.themeNumber)
                    .map((theme) => (
                      <div
                        key={theme.id}
                        className={`card cursor-pointer transition-all hover:shadow-lg ${selectedTheme?.id === theme.id ? 'ring-2 ring-primary-500' : ''
                          }`}
                        onClick={() => setSelectedTheme(selectedTheme?.id === theme.id ? null : theme)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${getBlockColor(block.code)}`}>
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
                    ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {blocks.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No hay bloques disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
};
