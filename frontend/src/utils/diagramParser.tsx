import dagre from 'dagre';
import { type Node, type Edge } from 'reactflow';

export interface DiagramData {
    nodes: Node[];
    edges: Edge[];
}

/**
 * Parsea descripciones de diagramas y los convierte en formato React Flow
 */
export function parseDiagram(text: string): DiagramData {
    console.log('=== PARSER DIAGRAM DEBUG ===');
    console.log('Texto completo recibido:', text);

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, Node>(); // nombre → nodo
    let nodeId = 0;

    // Dividir en líneas y procesar
    const lines = text.split('\n');
    console.log(`Total líneas: ${lines.length}`);

    // PASO 1: Extraer todos los nodos únicos de las líneas con flechas
    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Ignorar líneas vacías, headers, y metadata
        if (!trimmed ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('**') ||
            trimmed.startsWith('###') ||
            trimmed.toLowerCase().includes('fuente:') ||
            trimmed.toLowerCase().includes('descripción del flujo')) {
            return;
        }

        // Buscar líneas con flechas
        if (trimmed.includes('→') || trimmed.includes('->')) {
            console.log(`\nLínea ${index}: ${trimmed}`);

            // Dividir por flechas
            const parts = trimmed
                .split(/→|->/)
                .map(p => cleanNodeText(p))
                .filter(p => p.length > 0 && p.length < 150); // Filtrar textos muy largos

            console.log(`  Partes extraídas: ${parts.length}`);

            parts.forEach((part, idx) => {
                console.log(`    [${idx}] "${part}"`);

                // Crear nodo si no existe
                if (!nodeMap.has(part)) {
                    const nodeType = detectNodeType(part);
                    const node = createNode(nodeId++, part, nodeType);
                    nodeMap.set(part, node);
                    nodes.push(node);
                    console.log(`      ✅ Nodo creado: tipo=${nodeType}`);
                }
            });

            // PASO 2: Crear edges entre partes consecutivas
            for (let i = 0; i < parts.length - 1; i++) {
                const source = parts[i];
                const target = parts[i + 1];

                if (source && target && nodeMap.has(source) && nodeMap.has(target)) {
                    const sourceNode = nodeMap.get(source);
                    const targetNode = nodeMap.get(target);

                    if (sourceNode && targetNode) {
                        const edgeId = `e${sourceNode.id}-${targetNode.id}`;

                        // Evitar duplicados
                        if (!edges.find(e => e.id === edgeId)) {
                            edges.push({
                                id: edgeId,
                                source: sourceNode.id,
                                target: targetNode.id,
                                type: 'smoothstep',
                                animated: true,
                                style: { stroke: '#3b82f6', strokeWidth: 2 }
                            });
                            console.log(`      🔗 Edge: ${source.substring(0, 30)}... → ${target.substring(0, 30)}...`);
                        }
                    }
                }
            }
        }
    });

    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total nodos: ${nodes.length}`);
    console.log(`   Total edges: ${edges.length}`);

    nodes.forEach(n => {
        console.log(`   - [${n.id}] ${typeof n.data.label === 'string' ? n.data.label.substring(0, 40) : 'Complex Label'}`);
    });

    if (nodes.length === 0) {
        console.error('❌ No se encontraron nodos válidos');
        return { nodes: [], edges: [] };
    }

    // Aplicar layout profesional
    const result = applyDagreLayout(nodes, edges);
    console.log('============================\n');

    return result;
}

function createNode(id: number, label: string, type: string = 'process'): Node {
    // Limitar longitud de labels
    const displayLabel = label.length > 100 ? label.substring(0, 97) + '...' : label;

    const nodeTypes: Record<string, any> = {
        start: {
            type: 'default',
            style: {
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                borderRadius: '50%',
                padding: '30px 20px',
                border: '3px solid #16a34a',
                minWidth: '180px',
                minHeight: '180px',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '13px',
                lineHeight: '1.3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)'
            }
        },
        end: {
            type: 'default',
            style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '50%',
                padding: '30px 20px',
                border: '3px solid #dc2626',
                minWidth: '180px',
                minHeight: '180px',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '13px',
                lineHeight: '1.3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)'
            }
        },
        decision: {
            type: 'decision',
            style: {} // No necesita style porque usa componente custom
        },
        process: {
            type: 'default',
            style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '20px 26px',
                borderRadius: '12px',
                border: '3px solid #2563eb',
                minWidth: '260px',
                maxWidth: '320px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '13px',
                lineHeight: '1.4',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
            }
        },
        document: {
            type: 'default',
            style: {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                padding: '20px 26px',
                borderRadius: '8px',
                border: '3px solid #7c3aed',
                minWidth: '260px',
                maxWidth: '320px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '13px',
                lineHeight: '1.4',
                boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
            }
        }
    };

    const config = nodeTypes[type] || nodeTypes.process;

    return {
        id: id.toString(),
        data: { label: displayLabel },
        position: { x: 0, y: 0 },
        type: config.type,
        style: config.style
    };
}

function detectNodeType(text: string): string {
    const lower = text.toLowerCase();

    // Detectar INICIO
    if (lower.startsWith('inicio:') ||
        lower.startsWith('inicio ') ||
        lower.includes('comenzar') ||
        lower.includes('start')) {
        return 'start';
    }

    // Detectar FIN
    if (lower === 'fin' ||
        lower === 'fin.' ||
        lower.startsWith('fin ') ||
        lower.includes('terminar') ||
        lower.includes('finalizar') ||
        lower === 'end') {
        return 'end';
    }

    // Detectar DECISIÓN (preguntas)
    if (lower.includes('¿') && lower.includes('?')) {
        return 'decision';
    }

    // Detectar DOCUMENTO
    if (lower.includes('documento') ||
        lower.includes('informe') ||
        lower.includes('acta') ||
        lower.includes('resolución')) {
        return 'document';
    }

    return 'process';
}

function cleanNodeText(text: string): string {
    return text
        // Remover marcadores de lista
        .replace(/^[-*•]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/^[a-z]\)\s*/i, '')
        // Remover caracteres especiales de tablas
        .replace(/[┌┐└┘│─]/g, '')
        // Remover aclaraciones entre paréntesis al final
        .replace(/\s*\(si cumple\)\s*$/gi, '')
        .replace(/\s*\(si no cumple\)\s*$/gi, '')
        .replace(/\s*\(sí\)\s*$/gi, '')
        .replace(/\s*\(no\)\s*$/gi, '')
        .replace(/\s*\(si\)\s*$/gi, '')
        // Limpiar espacios
        .trim();
}

/**
 * Aplica layout profesional usando Dagre
 */
function applyDagreLayout(nodes: Node[], edges: Edge[]): DiagramData {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configuración optimizada para grafos verticales
    dagreGraph.setGraph({
        rankdir: 'TB',          // Top to Bottom
        align: 'UL',
        nodesep: 80,            // Separación horizontal entre nodos del mismo nivel
        ranksep: 140,           // Separación vertical entre niveles
        marginx: 60,
        marginy: 60,
        ranker: 'tight-tree'    // Algoritmo para minimizar cruces
    });

    // Añadir nodos con dimensiones precisas
    nodes.forEach((node) => {
        let width = 280;
        let height = 90;

        const style = node.style;

        // Nodos circulares (inicio/fin)
        if (style?.borderRadius === '50%') {
            width = 200;
            height = 200;
        }
        // Nodos de decisión (rombos)
        else if (style?.clipPath) {
            width = 240;
            height = 240;
        }

        dagreGraph.setNode(node.id, { width, height });
    });

    // Añadir edges
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calcular layout
    dagre.layout(dagreGraph);

    // Aplicar posiciones
    const layoutedNodes = nodes.map((node) => {
        const position = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                x: position.x - position.width / 2,
                y: position.y - position.height / 2,
            },
        };
    });

    console.log('✅ Layout Dagre completado');

    return { nodes: layoutedNodes, edges };
}
