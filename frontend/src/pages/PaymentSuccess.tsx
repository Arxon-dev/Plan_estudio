import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';

export const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();

    useEffect(() => {
        let isActive = true;

        const verifyPremiumStatus = async () => {
            // Intentar verificar el estado premium hasta 10 veces (10 segundos)
            for (let i = 0; i < 10; i++) {
                if (!isActive) return;

                const updatedUser = await refreshProfile();

                if (updatedUser?.isPremium) {
                    // ¡Éxito! Usuario ya es premium
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });

                    // Esperar un poco para que vea el confetti y redirigir
                    setTimeout(() => {
                        if (isActive) navigate('/dashboard');
                    }, 3000);
                    return;
                }

                // Esperar 1 segundo antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Si se agota el tiempo, redirigir de todos modos
            if (isActive) navigate('/dashboard');
        };

        verifyPremiumStatus();

        return () => {
            isActive = false;
        };
    }, [navigate, refreshProfile]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h1>
                <p className="text-gray-600 mb-8">
                    Bienvenido al plan Premium. Tu cuenta ha sido actualizada correctamente.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                    Ir al Dashboard
                </button>
            </div>
        </div>
    );
};
