import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

function DecisionNode({ data }: NodeProps) {
    return (
        <>
            {/* Handles de conexión */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: '#d97706',
                    borderColor: '#d97706',
                    top: '-8px'
                }}
            />

            {/* Contenedor para centrar el rombo */}
            <div style={{
                width: '220px',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {/* Rombo (diamante) usando transform rotate */}
                <div
                    style={{
                        width: '160px',
                        height: '160px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        transform: 'rotate(45deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #d97706',
                        boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                        position: 'absolute'
                    }}
                >
                    {/* Texto dentro del rombo (rotado de vuelta) */}
                    <div
                        style={{
                            transform: 'rotate(-45deg)',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '12px',
                            textAlign: 'center',
                            lineHeight: '1.3',
                            padding: '15px',
                            maxWidth: '120px',
                            wordWrap: 'break-word',
                            overflow: 'hidden'
                        }}
                    >
                        {data.label}
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: '#d97706',
                    borderColor: '#d97706',
                    bottom: '-8px'
                }}
            />
        </>
    );
}

export default memo(DecisionNode);
