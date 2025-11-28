import React from 'react';
import { MessageSquare, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface ChatCardProps {
    usage?: {
        queries_used: number;
        queries_limit: number;
        plan_type: 'free' | 'premium';
    };
    isLoading?: boolean;
}

export const ChatCard: React.FC<ChatCardProps> = ({ usage, isLoading }) => {
    const navigate = useNavigate();

    const percentage = usage ? (usage.queries_used / usage.queries_limit) * 100 : 0;
    const isLimitReached = usage ? usage.queries_used >= usage.queries_limit : false;

    return (
        <div
            onClick={() => navigate('/chat')}
            className={cn(
                "relative group cursor-pointer overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md",
                isLimitReached && "opacity-90"
            )}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    {usage?.plan_type === 'premium' && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-600 rounded-full border border-yellow-500/20">
                            PREMIUM
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-semibold mb-1">Chat con IA</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Resuelve tus dudas sobre el temario al instante.
                </p>

                {isLoading ? (
                    <div className="h-2 bg-muted rounded-full animate-pulse" />
                ) : usage ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className={isLimitReached ? "text-red-500 font-medium" : "text-muted-foreground"}>
                                {isLimitReached ? "Límite alcanzado" : `${usage.queries_used} de ${usage.queries_limit} consultas`}
                            </span>
                            <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all",
                                    isLimitReached ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">Cargando info...</div>
                )}
            </div>

            {isLimitReached && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-background shadow-lg border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium">
                        <Lock className="w-4 h-4" />
                        {usage?.plan_type === 'free' ? 'Actualizar Plan' : 'Límite alcanzado'}
                    </div>
                </div>
            )}
        </div>
    );
};
