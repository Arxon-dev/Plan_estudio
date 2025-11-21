import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Pago Cancelado</h1>
                <p className="text-gray-600 mb-8">
                    El proceso de pago ha sido cancelado. No se ha realizado ningún cargo en tu cuenta.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/premium')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
