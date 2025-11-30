import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Circle, Square, Triangle, Diamond, type LucideIcon } from 'lucide-react';
import { type OutlineNode } from '../../utils/outlineParser';

interface LevelConfig {
    color: string;
    icon: LucideIcon;
    size: string;
}

const levelConfig: Record<number, LevelConfig> = {
    1: {
        color: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100',
        icon: Square,
        size: 'text-base font-bold'
    },
    2: {
        color: 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100',
        icon: Circle,
        size: 'text-sm font-semibold'
    },
    3: {
        color: 'bg-violet-100 dark:bg-violet-900 border-violet-300 dark:border-violet-700 text-violet-900 dark:text-violet-100',
        icon: Triangle,
        size: 'text-sm'
    },
    4: {
        color: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100',
        icon: Diamond,
        size: 'text-xs'
    }
};

interface TreeNodeProps {
    node: OutlineNode;
    depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expandir primeros 2 niveles
    const hasChildren = node.children && node.children.length > 0;

    const config = levelConfig[node.level] || levelConfig[4];
    const Icon = config.icon;

    return (
        <div className="relative">
            {/* Nodo actual */}
            <div
                className={`flex items-center gap-3 p-3 rounded-lg border-2 mb-2 transition-all hover:shadow-md ${config.color}`}
                style={{ marginLeft: `${depth * 24}px` }}
            >
                {/* Botón expandir/colapsar */}
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 rounded p-1 transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                )}

                {/* Icono según nivel */}
                <Icon className="w-4 h-4 flex-shrink-0" />

                {/* Contenido */}
                <span className={config.size}>{node.title}</span>
            </div>

            {/* Línea conectora vertical */}
            {hasChildren && isExpanded && (
                <div
                    className="absolute left-0 top-12 w-0.5 bg-gray-300 dark:bg-gray-600"
                    style={{
                        height: 'calc(100% - 48px)',
                        marginLeft: `${depth * 24 + 24}px`
                    }}
                />
            )}

            {/* Hijos */}
            {hasChildren && isExpanded && (
                <div className="relative">
                    {node.children.map((child, idx) => (
                        <TreeNode key={child.id || idx} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface OutlineTreeViewProps {
    outline: OutlineNode;
}

export const OutlineTreeView: React.FC<OutlineTreeViewProps> = ({ outline }) => {
    if (!outline || !outline.title) {
        return (
            <div className="text-center text-muted-foreground p-4">
                No se pudo parsear el esquema
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border">
            <div className="mb-4 pb-3 border-b">
                <h3 className="text-lg font-bold text-primary">📋 Esquema Jerárquico</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Click en los nodos para expandir/colapsar
                </p>
            </div>

            <div className="space-y-2">
                <TreeNode node={outline} depth={0} />
            </div>
        </div>
    );
};
