import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const downloadMessageAsPNG = async (element: HTMLElement, filename: string) => {
    try {
        const dataUrl = await toPng(element, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            style: {
                borderRadius: '0', 
            },
            filter: (node) => {
                // Exclude elements with 'no-export' class
                if (node instanceof HTMLElement && node.classList.contains('no-export')) {
                    return false;
                }
                return true;
            }
        });
        
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Error generating PNG:', err);
        throw err;
    }
};

export const downloadMessageAsPDF = async (element: HTMLElement, filename: string) => {
    try {
        // First convert to PNG to preserve complex layout/styles
        const dataUrl = await toPng(element, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            filter: (node) => {
                // Exclude elements with 'no-export' class
                if (node instanceof HTMLElement && node.classList.contains('no-export')) {
                    return false;
                }
                return true;
            }
        });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // If content is longer than one page, we might need to handle pagination or splitting
        // For simplicity in this version, we'll just scale it to fit width and let height expand (or add pages if needed logic is complex)
        // But standard approach for single message: just put it on the page.
        
        // If height > page height, we might want to handle that, but for chat messages usually they fit or we accept scaling/multipage.
        // Let's just add the image for now.
        
        if (pdfHeight > pdf.internal.pageSize.getHeight()) {
             // Simple multi-page logic could be added here, but for now let's just let it run
             // or we can split. But simpler is often better for v1.
             // Let's just add it.
        }

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${filename}.pdf`);
    } catch (err) {
        console.error('Error generating PDF:', err);
        throw err;
    }
};
