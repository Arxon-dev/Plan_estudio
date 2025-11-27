import React from 'react';
import { Calendar, Repeat, ArrowRight, CheckCircle2, Settings } from 'lucide-react';

interface MethodologySelectorProps {
    onSelect: (methodology: 'rotation' | 'monthly-blocks' | 'custom-blocks') => void;
}

export const MethodologySelector: React.FC<MethodologySelectorProps> = ({ onSelect }) => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Elige tu Metodología de Estudio</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Selecciona cómo quieres que la IA organice tu plan de estudio. Ambas opciones se adaptan a tu horario y fecha de examen.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Opción 1: Rotación Inteligente */}
                <div
                    className="relative bg-white rounded-xl p-6 hover:border-blue-500 transition-all duration-300 cursor-pointer group border-2 border-transparent shadow-sm hover:shadow-xl"
                    onClick={() => onSelect('rotation')}
                >
                    <div className="absolute top-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="mb-6">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                            <Repeat className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Rotación Inteligente</h3>
                        <p className="text-sm text-muted-foreground mt-2 text-gray-500">
                            Sistema de repaso espaciado dinámico
                        </p>
                    </div>
                    <div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Múltiples temas activos simultáneamente</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Algoritmo de "Curva del Olvido"</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Ideal para mantener frescos muchos temas</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span>Variedad diaria de contenidos</span>
                            </li>
                        </ul>
                        <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 group-hover:shadow-lg">
                            Seleccionar Rotación <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Opción 2: Bloques Mensuales */}
                <div
                    className="relative bg-white rounded-xl p-6 hover:border-purple-500 transition-all duration-300 cursor-pointer group border-2 border-transparent shadow-sm hover:shadow-xl"
                    onClick={() => onSelect('monthly-blocks')}
                >
                    <div className="absolute top-4 right-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="mb-6">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Bloques Mensuales</h3>
                        <p className="text-sm text-muted-foreground mt-2 text-gray-500">
                            Enfoque intensivo y estructurado
                        </p>
                    </div>
                    <div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                <span>Temas nuevos configurables por mes + repasos</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                <span>Orden lógico de complejidad (Fácil → Difícil)</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                <span>Mes final exclusivo de repaso general</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                <span>Mayor sensación de cierre de temas</span>
                            </li>
                        </ul>
                        <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 group-hover:shadow-lg">
                            Seleccionar Bloques <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Opción 3: Bloques a Medida */}
                <div
                    className="relative bg-white rounded-xl p-6 hover:border-green-500 transition-all duration-300 cursor-pointer group border-2 border-transparent shadow-sm hover:shadow-xl"
                    onClick={() => onSelect('custom-blocks')}
                >
                    <div className="absolute top-4 right-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="mb-6">
                        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-green-600 group-hover:scale-110 transition-transform">
                            <Settings className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Bloques a Medida</h3>
                        <p className="text-sm text-muted-foreground mt-2 text-gray-500">
                            Control total sobre tu planificación
                        </p>
                    </div>
                    <div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                <span>Configura patrones semanales personalizados</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                <span>Define duración exacta por actividad</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                <span>Organización por bloques de 30 días</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                <span>Guarda borradores y continúa después</span>
                            </li>
                        </ul>
                        <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 group-hover:shadow-lg">
                            Seleccionar a Medida <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
