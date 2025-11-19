import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const MobileWarningBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil
    const checkIfMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Solo mostrar si es móvil Y no ha sido cerrado permanentemente
      const hasClosedBanner = localStorage.getItem('mobileWarningClosed');
      if (isMobileDevice && !hasClosedBanner) {
        setIsVisible(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('¡Link copiado! Pégalo en tu ordenador');
    }).catch(() => {
      toast.error('Error al copiar el link');
    });
  };

  const handleSendEmail = () => {
    const url = window.location.href;
    const subject = encodeURIComponent('Plan de Estudio - Accede desde tu PC');
    const body = encodeURIComponent(`Hola,

Abre este enlace desde tu ordenador para una mejor experiencia:

${url}

¡Saludos!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('Abriendo cliente de email...');
  };

  const handleSendWhatsApp = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Accede a Plan de Estudio desde tu PC para mejor experiencia: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleContinue = () => {
    setIsVisible(false);
    toast('Continuando en móvil. Puedes usar zoom para ver mejor.', { 
      icon: '📱',
      duration: 4000 
    });
  };

  const handleClosePermanently = () => {
    localStorage.setItem('mobileWarningClosed', 'true');
    setIsVisible(false);
    toast.success('No volverás a ver este mensaje');
  };

  if (!isVisible || !isMobile) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 text-2xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                <span>📱</span>
                Mejor Experiencia en Ordenador
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">
                Esta aplicación está optimizada para pantallas grandes. Te recomendamos abrirla desde un PC o tablet para ver todas las funciones correctamente.
              </p>
            </div>
            <button
              onClick={handleClosePermanently}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
              title="Cerrar permanentemente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 min-w-[120px] px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar Link
            </button>

            <button
              onClick={handleSendEmail}
              className="flex-1 min-w-[120px] px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex-1 min-w-[120px] px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>

            <button
              onClick={handleContinue}
              className="w-full px-3 py-2 bg-white text-orange-600 hover:bg-gray-100 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Continuar de Todos Modos
            </button>
          </div>

          {/* Tip */}
          <p className="text-xs opacity-75 mt-2 text-center">
            💡 Tip: Usa zoom (pellizcar pantalla) para mejorar la visualización
          </p>
        </div>
      </div>
    </div>
  );
};
