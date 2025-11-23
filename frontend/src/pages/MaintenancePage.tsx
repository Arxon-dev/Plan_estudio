import React from 'react';
import { WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
                    <WrenchScrewdriverIcon className="h-10 w-10 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Sistema en Mantenimiento
                </h1>

                <p className="text-gray-600 mb-8">
                    Estamos realizando mejoras en la plataforma para ofrecerte un mejor servicio.
                    Por favor, vuelve a intentarlo en unos minutos.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Reintentar conexión
                    </button>

                    <a
                        href="mailto:soporte@opomelilla.com"
                        className="block text-sm text-gray-500 hover:text-gray-700"
                    >
                        Contactar soporte
                    </a>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} OpoMelilla. Todos los derechos reservados.
            </div>
        </div>
    );
};
