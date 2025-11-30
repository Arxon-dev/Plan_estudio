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

    const lines = content.split('\n');
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // --- DETECCIÓN DE TABLAS ---
        if (line.match(/^\|.*\|$/)) {
            if (!inTable) {
                // Inicio de tabla (Header)
                inTable = true;
                tableHeaders = parseTableLine(line);
                
                // Saltar línea separadora tipo |---|---|
                if (lines[i + 1] && lines[i + 1].trim().match(/^\|[\s-]*\|/)) {
                    i++; 
                }
                continue;
            } else {
                // Fila de datos
                const row = parseTableLine(line);
                tableRows.push(row);
                
                // Si la siguiente línea NO es tabla, dibujamos
                const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
                if (!nextLine.startsWith('|')) {
                    // Dibujar tabla acumulada
                    const tableHeight = calculateTableHeight(tableHeaders, tableRows, maxWidth, fontRegular, fontBold, fontSizeBody);
                    const remainingSpace = yPosition - margin;
                    
                    // Decidir si saltar página
                    const fitsOnNewPage = tableHeight < (height - margin * 2);
                    
                    if (fitsOnNewPage && tableHeight > remainingSpace) {
                        page = pdfDoc.addPage();
                        yPosition = height - margin;
                    }
                    
                    const result = await drawTable(pdfDoc, page, tableHeaders, tableRows, margin, yPosition, maxWidth, fontRegular, fontBold, fontSizeBody);
                    page = result.page;
                    yPosition = result.y;
                    
                    yPosition -= 20; // Margen post-tabla
                    
                    inTable = false;
                    tableHeaders = [];
                    tableRows = [];
                }
                continue;
            }
        }

        // Si salimos del bucle y todavía hay tabla pendiente (caso fin de archivo)
        if (inTable && i === lines.length - 1) {
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

             inTable = false;
        }


        // --- RENDERIZADO DE TEXTO ---
        if (line.length === 0) {
            yPosition -= 10; 
            continue;
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
            
            // Wrap text con sangría y gestión de salto de página
            const result = drawWrappedText(pdfDoc, page, text, margin + 20, yPosition, maxWidth - 20, fontRegular, fontBold, fontSizeBody, margin, height);
            page = result.page;
            yPosition = result.y;
            
            yPosition -= 5;
        }
        else {
            // Párrafo normal con gestión de salto de página
            const result = drawWrappedText(pdfDoc, page, line, margin, yPosition, maxWidth, fontRegular, fontBold, fontSizeBody, margin, height);
            page = result.page;
            yPosition = result.y;
            
            yPosition -= 10;
        }
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
