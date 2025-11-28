import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UpgradeBanner: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20 p-2 text-center">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>¿Necesitas más consultas?</span>
                <Link to="/premium" className="font-semibold hover:underline">
                    Pásate a Premium
                </Link>
            </p>
        </div>
    );
};
