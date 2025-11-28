import React from 'react';
import { cn } from '../../lib/utils';

interface UsageIndicatorProps {
    usage: {
        queries_used: number;
        queries_limit: number;
        plan_type: 'free' | 'premium';
    };
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ usage }) => {
    const percentage = Math.min(100, (usage.queries_used / usage.queries_limit) * 100);

    let colorClass = 'bg-green-500';
    if (percentage > 70) colorClass = 'bg-yellow-500';
    if (percentage >= 100) colorClass = 'bg-red-500';

    return (
        <div className="flex flex-col items-end gap-1 min-w-[100px]">
            <div className="text-xs text-muted-foreground">
                {usage.queries_used} / {usage.queries_limit} consultas
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500", colorClass)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
