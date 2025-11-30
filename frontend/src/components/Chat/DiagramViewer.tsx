import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileImage, FileCode, Maximize2, Minimize2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DiagramViewerProps {
    code: string;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ code }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        });

        const renderDiagram = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, code);
                setSvgContent(svg);
            } catch (error) {
                console.error('Error rendering mermaid:', error);
                setSvgContent('<div class="text-red-500 p-4">Error al renderizar el diagrama. Por favor, intenta regenerarlo.</div>');
            }
        };

        renderDiagram();
    }, [code]);

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

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPNG = async () => {
        if (!containerRef.current || downloading) return;
        setDownloading(true);

        try {
            const svgElement = containerRef.current.querySelector('svg');
            if (!svgElement) throw new Error('SVG no encontrado');

            const canvas = await html2canvas(containerRef.current, {
                backgroundColor: '#1e1e1e',
                scale: 4,
                logging: false,
                useCORS: true
            });

            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `diagrama-${Date.now()}.png`;
            link.href = url;
            link.click();
        } catch (error) {
            console.error('Error descargando PNG:', error);
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadSVG = () => {
        if (!svgContent) return;

        try {
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `diagrama-${Date.now()}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando SVG:', error);
        }
    };

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    return (
        <div className={`
            transition-all duration-300 ease-in-out bg-card shadow-sm
            ${isFullscreen
                ? 'fixed inset-0 z-50 flex flex-col m-0 rounded-none h-screen w-screen'
                : 'my-6 border rounded-xl overflow-hidden relative'
            }
        `}>
            {/* Header con controles */}
            <div className="flex justify-between items-center px-4 py-2 bg-muted/50 border-b backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Diagrama Visual
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={handleCopy}
                        title="Copiar código Mermaid"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        <span className="hidden sm:inline">{copied ? 'Copiado' : 'Código'}</span>
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-blue-600"
                        onClick={handleDownloadPNG}
                        disabled={downloading}
                        title="Descargar PNG Alta Resolución"
                    >
                        <FileImage className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">PNG HD</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-purple-600"
                        onClick={handleDownloadSVG}
                        title="Descargar SVG Vectorial"
                    >
                        <FileCode className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">SVG</span>
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                </div>
            </div>

            {/* Contenedor del diagrama */}
            <div
                ref={containerRef}
                className={`
                    p-6 overflow-auto flex justify-center bg-[#1e1e1e]
                    ${isFullscreen ? 'flex-1 h-full items-center' : 'min-h-[200px]'}
                `}
            >
                {!svgContent && (
                    <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm animate-pulse">
                        Generando visualización...
                    </div>
                )}

                <div
                    className={`mermaid-diagram flex justify-center ${isFullscreen ? 'w-full h-full' : 'w-full'}`}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    style={isFullscreen ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}
                />
            </div>

            {downloading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10 rounded-xl">
                    <div className="bg-background px-4 py-2 rounded-lg shadow-lg text-xs font-medium animate-pulse">
                        Generando imagen HD...
                    </div>
                </div>
            )}
        </div>
    );
};
