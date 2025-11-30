import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Panel,
    useReactFlow
} from 'reactflow';
import { FileImage, FileCode, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import 'reactflow/dist/style.css';
import { type DiagramData } from '../../utils/diagramParser';
import DecisionNode from './DecisionNode';

interface FlowDiagramViewProps {
    diagram: DiagramData;
}

const nodeTypes = {
    decision: DecisionNode
};

export function FlowDiagramView({ diagram }: FlowDiagramViewProps) {
    const flowRef = useRef<HTMLDivElement>(null);
    const { getNodes, getViewport, setViewport } = useReactFlow();
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    console.log('=== FlowDiagramView DEBUG ===');
    console.log('Diagram recibido:', diagram);
    console.log('Nodos:', diagram?.nodes?.length || 0);
    console.log('Edges:', diagram?.edges?.length || 0);

    const [nodes, , onNodesChange] = useNodesState(diagram?.nodes || []);
    const [edges, , onEdgesChange] = useEdgesState(
        (diagram?.edges || []).map(edge => ({
            ...edge,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6',
                width: 20,
                height: 20
            }
        }))
    );

    // Manejar tecla ESC para salir de pantalla completa
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        // Pequeño delay para que React Flow recalcule dimensiones
        setTimeout(() => {
            // Opcional: fitView() si queremos recentrar al cambiar tamaño
        }, 100);
    };

    const exportDiagram = useCallback(async (format: 'png' | 'svg' | 'copy') => {
        if (downloading) return;

        try {
            setDownloading(true);

            // 1. Guardar viewport actual
            const viewport = getViewport();

            // 2. Calcular bounding box de todos los nodos
            const currentNodes = getNodes();
            if (currentNodes.length === 0) return;

            const nodesBounds = currentNodes.reduce(
                (acc, node) => {
                    const x = node.position.x;
                    const y = node.position.y;
                    const width = node.width || 260;
                    const height = node.height || 80;

                    return {
                        x: Math.min(acc.x, x),
                        y: Math.min(acc.y, y),
                        x2: Math.max(acc.x2, x + width),
                        y2: Math.max(acc.y2, y + height)
                    };
                },
                { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity }
            );

            const width = nodesBounds.x2 - nodesBounds.x;
            const height = nodesBounds.y2 - nodesBounds.y;
            const padding = 100;

            // 3. Ajustar viewport para ver todo
            setViewport({
                x: -nodesBounds.x + padding,
                y: -nodesBounds.y + padding,
                zoom: 1
            });

            // Esperar renderizado
            await new Promise(resolve => setTimeout(resolve, 300));

            // 4. Seleccionar elemento
            const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
            if (!reactFlowElement) throw new Error('No se encontró el elemento ReactFlow');

            let dataUrl = '';

            if (format === 'png' || format === 'copy') {
                const scale = 4; // 4K
                dataUrl = await toPng(reactFlowElement, {
                    backgroundColor: '#ffffff',
                    width: (width + padding * 2) * scale,
                    height: (height + padding * 2) * scale,
                    style: {
                        width: `${width + padding * 2}px`,
                        height: `${height + padding * 2}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                    },
                    pixelRatio: 1,
                    cacheBust: true,
                    filter: (node) => {
                        return !node.classList?.contains('react-flow__controls') &&
                            !node.classList?.contains('react-flow__minimap') &&
                            !node.classList?.contains('react-flow__attribution');
                    }
                });
            } else if (format === 'svg') {
                dataUrl = await toSvg(reactFlowElement, {
                    backgroundColor: '#ffffff',
                    width: width + padding * 2,
                    height: height + padding * 2,
                    filter: (node) => {
                        return !node.classList?.contains('react-flow__controls') &&
                            !node.classList?.contains('react-flow__minimap') &&
                            !node.classList?.contains('react-flow__attribution');
                    }
                });
            }

            // 5. Restaurar viewport
            setViewport(viewport);

            // 6. Acción final
            if (format === 'copy') {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                console.log('✅ Copiado al portapapeles');
            } else {
                const link = document.createElement('a');
                link.download = `diagrama-${Date.now()}.${format}`;
                link.href = dataUrl;
                link.click();
                console.log(`✅ Descargado como ${format}`);
            }

        } catch (error) {
            console.error('Error exportando:', error);
            alert('Error al exportar. Intenta de nuevo.');
        } finally {
            setDownloading(false);
        }
    }, [downloading, getNodes, getViewport, setViewport]);

    if (!diagram) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p className="text-lg">❌ No se recibió información del diagrama</p>
                <p className="text-sm mt-2">Objeto diagram es null o undefined</p>
            </div>
        );
    }

    if (!nodes || nodes.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p className="text-lg">⚠️ No se pudo generar el diagrama de flujo</p>
                <p className="text-sm mt-2">No se detectaron nodos en el texto de respuesta</p>
                <details className="mt-4 text-left max-w-2xl mx-auto">
                    <summary className="cursor-pointer text-blue-600">Ver datos de debug</summary>
                    <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-60">
                        {JSON.stringify({ diagram, nodes, edges }, null, 2)}
                    </pre>
                </details>
            </div>
        );
    }

    return (
        <div className={`
            transition-all duration-300 ease-in-out bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg border overflow-hidden
            ${isFullscreen
                ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
                : 'w-full h-[700px] rounded-xl'
            }
        `}>
            {/* Header */}
            <div className="px-6 py-3 border-b bg-background/80 backdrop-blur flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <span>🔄</span>
                        <span>Diagrama de Flujo</span>
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                            ({nodes.length} nodos, {edges.length} conexiones)
                        </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Rueda: zoom • Arrastrar: mover • <strong>PNG Ultra HD 4K</strong> disponible
                    </p>
                </div>

                {/* Botones de exportación */}
                <div className="flex gap-2">
                    <button
                        onClick={() => exportDiagram('copy')}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        title="Copiar imagen en alta calidad al portapapeles"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">¡Copiado!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span className="hidden sm:inline">Copiar</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => exportDiagram('png')}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        title="Descargar PNG en resolución Ultra HD 4K (máxima calidad)"
                    >
                        <FileImage className="w-4 h-4" />
                        <span className="hidden sm:inline">PNG 4K</span>
                    </button>
                    <button
                        onClick={() => exportDiagram('svg')}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        title="Descargar SVG vectorial (escalable sin pérdida)"
                    >
                        <FileCode className="w-4 h-4" />
                        <span className="hidden sm:inline">SVG</span>
                    </button>
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground rounded-lg text-sm font-medium transition-all shadow-sm"
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* React Flow Canvas */}
            <div ref={flowRef} className="h-[calc(100%-60px)]" data-id="flow-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                    minZoom={0.2}
                    maxZoom={2}
                    defaultEdgeOptions={{
                        animated: true,
                        style: { stroke: '#3b82f6', strokeWidth: 2 }
                    }}
                >
                    <Background
                        color="#cbd5e1"
                        gap={20}
                        size={1.5}
                        variant={undefined}
                    />
                    <Controls
                        showInteractive={false}
                        className="bg-background border rounded-lg shadow-lg"
                    />
                    <MiniMap
                        nodeColor={(node) => {
                            if (node.style?.background) {
                                const match = (node.style.background as string).match(/#[0-9a-f]{6}/i);
                                return match ? match[0] : '#3b82f6';
                            }
                            return '#3b82f6';
                        }}
                        maskColor="rgba(0, 0, 0, 0.1)"
                        className="bg-background border rounded-lg shadow-md"
                    />

                    {/* Panel con leyenda mejorada */}
                    <Panel position="top-right" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 rounded-xl p-4 shadow-xl">
                        <div className="text-xs space-y-3">
                            <p className="font-bold mb-3 text-sm border-b pb-2">📋 Leyenda</p>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-md"></div>
                                <span className="font-medium">Inicio</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"></div>
                                <span className="font-medium">Proceso</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 shadow-md"
                                    style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
                                <span className="font-medium">Decisión</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 shadow-md"></div>
                                <span className="font-medium">Documento</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-md"></div>
                                <span className="font-medium">Fin</span>
                            </div>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Indicador de progreso */}
            {downloading && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse z-50">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Generando imagen en Ultra HD 4K...</span>
                </div>
            )}
        </div>
    );
}
