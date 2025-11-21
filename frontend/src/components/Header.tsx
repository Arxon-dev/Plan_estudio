import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    backPath?: string;
    children?: React.ReactNode;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title = 'Plan de Estudio',
    showBack = false,
    backPath = '/dashboard',
    children,
    className = ''
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isPremium = user?.isPremium;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={`bg-white shadow ${isPremium ? 'border-b-2 border-amber-400' : ''} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={() => navigate(backPath)}
                            className="mr-2 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Volver"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {isPremium && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 shadow-sm">
                            <SparklesIcon className="w-3 h-3 text-amber-500" />
                            PREMIUM
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:inline">
                        ¡Hola, {user?.firstName}!
                    </span>
                    {children}
                    <button onClick={handleLogout} className="btn-secondary text-sm">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </header>
    );
};
