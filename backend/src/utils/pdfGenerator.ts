import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

export async function createSummaryPDF(title: string, content: string): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();
    
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSizeHeader = 18;
    const fontSizeSubHeader = 14;
    const fontSizeBody = 10;
    const margin = 50;
    const maxWidth = width - (margin * 2);
    
    let yPosition = height - margin;

    // Helper para gestionar saltos de página
    const checkPageBreak = (neededSpace: number) => {
        if (yPosition - neededSpace < margin) {
            page = pdfDoc.addPage();
            yPosition = height - margin;
        }
    };

    // Título Principal
    page.drawText(title, {
        x: margin,
        y: yPosition,
        size: fontSizeHeader,
        font: fontBold,
        color: rgb(0, 0.2, 0.4),
    });
    yPosition -= 40;

    // Pre-procesar contenido para arreglar tablas compactadas (sin saltos de línea)
    // Detecta patrones | ... | ... | y si están seguidos por otro | ... | sin salto de línea, lo inserta.
    // Un patrón simple es buscar `|` seguido de espacio/texto y luego `|` que se repite, pero cuidado con falsos positivos.
    // Mejor aproximación: Si una línea es MUY larga y contiene múltiples `|` que parecen filas distintas.
    // Pero la regex segura es reemplazar `| |` por `|\n|` si es el patrón de unión de filas.
    // A menudo el modelo devuelve `| cell | cell | | cell | cell |`.
    
    let processedContent = content;
    // Intento 1: Insertar saltos de línea si detectamos el final de una fila y el inicio de otra pegados
    // Buscamos "| |" que suele ser el delimitador entre filas cuando se pierde el salto de línea
    // Ojo: " | " podría ser contenido válido, pero en tablas markdown raw es raro.
    // Una tabla markdown típica: | a | b |\n| c | d |
    // Si falta el \n: | a | b || c | d |
    
    // Reemplazar '||' por '|\n|' para separar filas pegadas
    processedContent = processedContent.replace(/\|\|/g, '|\n|');
    
    // Reemplazar '| |' por '|\n|' (común si hay un espacio entre filas pegadas)
    // Usamos una regex que busque el final de una fila y el inicio de otra
    // Final de fila: `|`
    // Espacios opcionales
    // Inicio de fila: `|`
    // Pero no queremos romper `| cell |`
    // La heurística: Si hay `|` seguido de espacios y luego otro `|`, y esto ocurre en una línea que YA tiene estructura de tabla...
    // Vamos a asumir que si el usuario ve todo pegado, es porque faltan los \n.
    
    // Vamos a hacer un split más inteligente.
    const lines = processedContent.split('\n');
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Si la línea es muy larga y contiene muchos pipes, intentamos dividirla si parece contener múltiples filas
        // Regex para encontrar patrones de cierre y apertura de fila: `\| *\|`
        // Pero cuidado con celdas vacías `||`.
        // Vamos a asumir que si una línea tiene el patrón `|---|` es la separadora.
        
        // Estrategia: Si la línea tiene múltiples ocurrencias de `|`, la analizamos.
        // Si detectamos que contiene la estructura del header y luego filas en la MISMA línea.
        
        // Caso específico del usuario: | Concepto | ... | |---|---| ... | ... |
        // Vamos a pre-procesar la línea actual para dividirla si es necesario
        if (line.includes('|') && line.length > 100) { // Solo si es larga sospechamos
             // Intentar insertar saltos de línea antes de cada inicio de fila aparente
             // Un inicio de fila aparente es un `|` que no está precedido por texto (o es el inicio de la línea)
             // Pero en una línea pegada: ... | dato | | otro dato | ...
             // Reemplazamos `| |` por `|\n|`
             line = line.replace(/\|\s*\|/g, (match) => {
                 // Si es `||` (celda vacía o fin-inicio), o `| |`.
                 // Es arriesgado si hay celdas vacías reales.
                 // Pero en el contexto del problema (tablas rotas), es mejor intentar arreglar.
                 // Mejor: si vemos la estructura del separador `|---|`, aseguramos que tenga saltos alrededor.
                 if (match.trim() === '||') return '|\n|';
                 return match;
             });
             
             // Asegurar que el separador |---| tenga saltos
             line = line.replace(/(\|\s*-{3,}\s*\|)/g, '\n$1\n');
        }
        
        // Re-split por si hemos introducido saltos
        const subLines = line.split('\n');
        
        for (let j = 0; j < subLines.length; j++) {
            const subLine = subLines[j].trim();
            if (subLine.length === 0) continue;
            
            await processLine(subLine, i + 1 < lines.length ? lines[i+1] : null);
        }
    }
    
    async function processLine(line: string, nextLineOriginal: string | null) {
        // --- DETECCIÓN DE TABLAS ---
        if (line.match(/^\|.*\|$/)) {
            if (!inTable) {
                // Inicio de tabla (Header)
                inTable = true;
                tableHeaders = parseTableLine(line);
                
                // No podemos saltar simplemente i++, porque estamos en un sub-loop.
                // Debemos detectar si la SIGUIENTE sub-línea o línea original es el separador.
                // Como hemos simplificado, asumiremos que el separador viene después.
                // Si el separador NO viene, la tabla se verá rara, pero funcionará.
                // PERO: en el código original saltábamos el separador.
                // Aquí no podemos acceder fácilmente al "siguiente" en el loop principal desde processLine sin lógica compleja.
                // Simplificación: Si la línea actual es un separador |---| (solo guiones y pipes), la ignoramos.
                if (line.match(/^\|[\s-]*\|$/)) {
                    inTable = false; // Reset temporal, pero realmente queremos ignorarla.
                    // Si era header, ya lo guardamos. Si es separador, no hacemos nada.
                    // Corrección: Si acabamos de empezar tabla, esta línea DEBERÍA ser el separador.
                    // Si detectamos separador, simplemente retornamos.
                    return;
                }
                return;
            } else {
                // Si encontramos un separador en medio (raro), lo ignoramos
                if (line.match(/^\|[\s-]*\|$/)) {
                    return;
                }

                // Fila de datos
                const row = parseTableLine(line);
                tableRows.push(row);
                
                // ¿Cómo sabemos si es el final de la tabla?
                // En el loop original mirábamos `nextLine`.
                // Aquí, si `nextLineOriginal` no es tabla, o si es la última subLínea y no hay más...
                // Es complejo.
                // ENFOQUE ALTERNATIVO: Acumular filas. Si la siguiente línea NO empieza por pipe, dibujar.
                // Como estamos en `processLine`, no sabemos qué viene después exactamente si estamos en subLines.
                // PERO: Si estamos en el loop principal, `nextLineOriginal` nos da una pista.
                
                // Vamos a simplificar: Acumulamos todo.
                // Solo dibujamos cuando detectamos una línea que NO es tabla, o al final del documento.
                // Esto requiere que `processLine` maneje el estado `inTable` globalmente (que ya lo hace).
                // Y necesitamos un trigger para "fin de tabla".
                return;
            }
        } else {
            // Línea que NO es tabla.
            // Si estábamos en tabla, hay que dibujarla AHORA.
            if (inTable) {
                await drawCurrentTable();
            }
            
            // --- RENDERIZADO DE TEXTO NORMAL ---
            if (line.length === 0) {
                yPosition -= 10; 
                return;
            }
    
            if (line.startsWith('## ')) {
                checkPageBreak(40);
                page.drawText(line.replace('## ', ''), {
                    x: margin,
                    y: yPosition,
                    size: fontSizeSubHeader,
                    font: fontBold,
                    color: rgb(0.2, 0.2, 0.2),
                });
                yPosition -= 25;
            } 
            else if (line.startsWith('### ')) {
                checkPageBreak(30);
                page.drawText(line.replace('### ', ''), {
                    x: margin,
                    y: yPosition,
                    size: fontSizeBody + 2,
                    font: fontBold,
                    color: rgb(0.3, 0.3, 0.3),
                });
                yPosition -= 20;
            }
            else if (line.startsWith('- ') || line.startsWith('* ')) {
                const text = line.substring(2);
                checkPageBreak(15);
                page.drawText('•', { x: margin + 5, y: yPosition, size: fontSizeBody, font: fontBold, color: rgb(0,0,0) });
                
                const result = drawWrappedText(pdfDoc, page, text, margin + 20, yPosition, maxWidth - 20, fontRegular, fontBold, fontSizeBody, margin, height);
                page = result.page;
                yPosition = result.y;
                
                yPosition -= 5;
            }
            else {
                const result = drawWrappedText(pdfDoc, page, line, margin, yPosition, maxWidth, fontRegular, fontBold, fontSizeBody, margin, height);
                page = result.page;
                yPosition = result.y;
                
                yPosition -= 10;
            }
        }
    }
    
    // Al final del documento, si queda tabla pendiente
    if (inTable) {
        await drawCurrentTable();
    }

    async function drawCurrentTable() {
         // Filtrar filas vacías o separadores que se hayan colado
         tableRows = tableRows.filter(r => !r.every(c => c.trim() === '' || c.match(/^-+$/)));
         
         if (tableHeaders.length > 0 && tableRows.length > 0) {
            const tableHeight = calculateTableHeight(tableHeaders, tableRows, maxWidth, fontRegular, fontBold, fontSizeBody);
            const remainingSpace = yPosition - margin;
            
            const fitsOnNewPage = tableHeight < (height - margin * 2);
            
            if (fitsOnNewPage && tableHeight > remainingSpace) {
                page = pdfDoc.addPage();
                yPosition = height - margin;
            }
   
            const result = await drawTable(pdfDoc, page, tableHeaders, tableRows, margin, yPosition, maxWidth, fontRegular, fontBold, fontSizeBody);
            page = result.page;
            yPosition = result.y;
            
            yPosition -= 20; 
         }
         
         inTable = false;
         tableHeaders = [];
         tableRows = [];
    }

    return await pdfDoc.save();
}

// --- HELPERS ---

function parseTableLine(line: string): string[] {
    // Manejo básico de columnas escapadas o vacías
    const parts = line.split('|');
    // Eliminar el primer y último elemento si son vacíos (común en markdown | a | b |)
    if (parts.length > 0 && parts[0].trim() === '') parts.shift();
    if (parts.length > 0 && parts[parts.length - 1].trim() === '') parts.pop();
    
    return parts.map(c => c.trim());
}

function calculateTableHeight(
    headers: string[], 
    rows: string[][], 
    tableWidth: number, 
    font: PDFFont, 
    fontBold: PDFFont,
    fontSize: number
): number {
    const colWidth = tableWidth / Math.max(headers.length, 1);
    const padding = 5;
    const lineHeight = fontSize + 2;
    let totalHeight = 0;

    // Header Height
    const headerLines = headers.map(h => getWrappedLines(h, colWidth - (padding * 2), fontBold, fontBold, fontSize));
    const maxHeaderLines = Math.max(...headerLines.map(l => l.length), 1);
    totalHeight += (maxHeaderLines * lineHeight) + (padding * 2);

    // Rows Height
    for (const row of rows) {
        const cellLinesData = row.map((cell, i) => {
             if (i >= headers.length) return [];
             const cellText = cell || '-';
             return getWrappedLines(cellText, colWidth - (padding * 2), font, fontBold, fontSize);
        });
        const maxLines = Math.max(...cellLinesData.map(l => l.length), 1);
        totalHeight += (maxLines * lineHeight) + (padding * 2);
    }

    return totalHeight;
}

async function drawTable(
    pdfDoc: PDFDocument,
    page: PDFPage, 
    headers: string[], 
    rows: string[][], 
    x: number, 
    startY: number,
    tableWidth: number, 
    font: PDFFont, 
    fontBold: PDFFont,
    fontSize: number
): Promise<{ page: PDFPage, y: number }> {
    const colWidth = tableWidth / Math.max(headers.length, 1);
    const padding = 5;
    const lineHeight = fontSize + 2;
    
    let currentPage = page;
    let currentY = startY;
    const { height: pageHeight } = currentPage.getSize();
    const bottomMargin = 50;

    // --- HEADER ---
    const headerLines = headers.map(h => getWrappedLines(h, colWidth - (padding * 2), fontBold, fontBold, fontSize));
    const maxHeaderLines = Math.max(...headerLines.map(l => l.length), 1);
    const headerHeight = (maxHeaderLines * lineHeight) + (padding * 2);

    const drawHeader = (targetPage: PDFPage, y: number) => {
        // Fondo del header
        targetPage.drawRectangle({
            x: x,
            y: y - headerHeight,
            width: tableWidth,
            height: headerHeight,
            color: rgb(0.9, 0.9, 0.95),
        });
        // Bordes del header
        targetPage.drawRectangle({
             x: x,
             y: y - headerHeight,
             width: tableWidth,
             height: headerHeight,
             borderColor: rgb(0.6, 0.6, 0.6),
             borderWidth: 0.5,
        });

        headers.forEach((header, i) => {
            const lines = headerLines[i];
            // Centrar verticalmente si hay espacio
            const cellContentHeight = lines.length * lineHeight;
            const verticalOffset = (headerHeight - cellContentHeight) / 2;
            
            let lineY = y - padding - verticalOffset - fontSize + 2; // Ajuste fino
            
            lines.forEach(line => {
                let currentX = x + (i * colWidth) + padding;
                line.tokens.forEach(token => {
                    targetPage.drawText(token.text, {
                        x: currentX,
                        y: lineY,
                        size: fontSize,
                        font: token.font,
                        color: rgb(0, 0, 0),
                    });
                    currentX += token.width;
                });
                lineY -= lineHeight;
            });
            
            // Línea vertical separadora (excepto última)
            if (i < headers.length - 1) {
                targetPage.drawLine({
                    start: { x: x + ((i + 1) * colWidth), y: y },
                    end: { x: x + ((i + 1) * colWidth), y: y - headerHeight },
                    thickness: 0.5,
                    color: rgb(0.7, 0.7, 0.7),
                });
            }
        });
    };

    // Verificar si cabe el header
    if (currentY - headerHeight < bottomMargin) {
        currentPage = pdfDoc.addPage();
        currentY = pageHeight - bottomMargin;
    }

    drawHeader(currentPage, currentY);
    currentY -= headerHeight;

    // --- FILAS ---
    for (const row of rows) {
        const cellLinesData = row.map((cell, i) => {
             if (i >= headers.length) return [];
             const cellText = cell || '';
             return getWrappedLines(cellText, colWidth - (padding * 2), font, fontBold, fontSize);
        });

        const maxLines = Math.max(...cellLinesData.map(l => l.length), 1);
        const rowHeight = (maxLines * lineHeight) + (padding * 2);

        // Chequear salto de página
        if (currentY - rowHeight < bottomMargin) {
             currentPage = pdfDoc.addPage();
             currentY = pageHeight - bottomMargin;
             
             drawHeader(currentPage, currentY);
             currentY -= headerHeight;
        }

        // Dibujar celdas
        cellLinesData.forEach((lines, i) => {
            let lineY = currentY - padding - fontSize + 2;
            
            lines.forEach(line => {
                let currentX = x + (i * colWidth) + padding;
                line.tokens.forEach(token => {
                    currentPage.drawText(token.text, {
                        x: currentX,
                        y: lineY,
                        size: fontSize,
                        font: token.font,
                        color: rgb(0.2, 0.2, 0.2),
                    });
                    currentX += token.width;
                });
                lineY -= lineHeight;
            });

             // Línea vertical separadora (excepto última)
             if (i < headers.length - 1) {
                currentPage.drawLine({
                    start: { x: x + ((i + 1) * colWidth), y: currentY },
                    end: { x: x + ((i + 1) * colWidth), y: currentY - rowHeight },
                    thickness: 0.5,
                    color: rgb(0.8, 0.8, 0.8),
                });
            }
        });
        
        // Borde exterior y separadores horizontales
        currentPage.drawRectangle({
            x: x,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 0.5,
        });

        currentY -= rowHeight;
    }

    return { page: currentPage, y: currentY };
}

// --- NUEVO SISTEMA DE WRAP CON NEGRITAS ---

interface TextToken {
    text: string;
    isBold: boolean;
}

interface DrawToken {
    text: string;
    font: PDFFont;
    width: number;
}

interface LineData {
    tokens: DrawToken[];
    width: number;
}

function parseMarkdown(text: string): TextToken[] {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return { text: part.substring(2, part.length - 2), isBold: true };
        }
        return { text: part, isBold: false };
    }).filter(t => t.text.length > 0);
}

function getWrappedLines(
    text: string,
    maxWidth: number,
    fontRegular: PDFFont,
    fontBold: PDFFont,
    fontSize: number
): LineData[] {
    const tokens = parseMarkdown(text);
    const lines: LineData[] = [];
    let currentLineTokens: DrawToken[] = [];
    let currentLineWidth = 0;

    for (const token of tokens) {
        const font = token.isBold ? fontBold : fontRegular;
        const words = token.text.split(' ');

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word === '') {
                // Preservar espacios explícitos si es necesario, pero split(' ') los elimina mayormente
                // Si hay doble espacio, split genera ''. 
                continue; 
            }

            // Determinar si necesitamos espacio previo
            // Si es el primer token de la línea, no.
            // Si venimos de otro token, sí (asumiendo separación por espacio natural).
            const addSpace = (currentLineTokens.length > 0);
            const spaceWidth = addSpace ? font.widthOfTextAtSize(' ', fontSize) : 0;
            
            const wordWidth = font.widthOfTextAtSize(word, fontSize);
            
            if (currentLineWidth + spaceWidth + wordWidth > maxWidth && currentLineWidth > 0) {
                // Terminar línea actual
                lines.push({ tokens: currentLineTokens, width: currentLineWidth });
                
                // Empezar nueva línea con la palabra actual (sin espacio previo)
                currentLineTokens = [{ text: word, font: font, width: wordWidth }];
                currentLineWidth = wordWidth;
            } else {
                // Añadir a línea actual
                if (addSpace) {
                    currentLineTokens.push({ text: ' ', font: font, width: spaceWidth });
                    currentLineWidth += spaceWidth;
                }
                currentLineTokens.push({ text: word, font: font, width: wordWidth });
                currentLineWidth += wordWidth;
            }
        }
    }
    
    // Añadir última línea remanente
    if (currentLineTokens.length > 0) {
        lines.push({ tokens: currentLineTokens, width: currentLineWidth });
    } else if (lines.length === 0 && text.length > 0) {
        // Caso raro: texto que no generó tokens (quizás solo espacios?)
    }

    return lines;
}

function drawWrappedText(
    pdfDoc: PDFDocument,
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontRegular: PDFFont,
    fontBold: PDFFont,
    fontSize: number,
    bottomMargin: number,
    pageHeight: number
): { page: PDFPage, y: number } {
    const lines = getWrappedLines(text, maxWidth, fontRegular, fontBold, fontSize);
    let currentPage = page;
    let currentY = y;
    const lineHeight = fontSize + 4;

    lines.forEach(line => {
        // Check for page break before drawing the line
        if (currentY < bottomMargin) {
            currentPage = pdfDoc.addPage();
            currentY = pageHeight - bottomMargin;
        }

        let currentX = x;
        line.tokens.forEach(token => {
            currentPage.drawText(token.text, {
                x: currentX,
                y: currentY,
                size: fontSize,
                font: token.font,
                color: rgb(0.2, 0.2, 0.2)
            });
            currentX += token.width;
        });
        currentY -= lineHeight;
    });
    
    return { page: currentPage, y: currentY };
}

function flushLine(
    page: PDFPage, 
    tokens: { text: string, width: number, isBold: boolean }[], 
    x: number, 
    y: number, 
    fontSize: number, 
    fontRegular: PDFFont, 
    fontBold: PDFFont
) {
    let currentX = x;
    for (const token of tokens) {
        const font = token.isBold ? fontBold : fontRegular;
        page.drawText(token.text, {
            x: currentX,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0.2, 0.2, 0.2)
        });
        currentX += token.width; 
    }
}
