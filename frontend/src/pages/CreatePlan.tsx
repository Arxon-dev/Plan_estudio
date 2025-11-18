import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const CreatePlan: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al Calendario Inteligente
    navigate('/smart-calendar');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al Calendario Inteligente...</p>
      </div>
    </div>
  );
};