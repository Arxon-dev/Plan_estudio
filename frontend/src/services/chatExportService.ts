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
        const dataUrl = await toPng(element, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            filter: (node) => {
                if (node instanceof HTMLElement && node.classList.contains('no-export')) {
                    return false;
                }
                return true;
            }
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pageHeight = pdf.internal.pageSize.getHeight();

        let heightLeft = pdfHeight;
        let position = 0;

        // First page
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        // Subsequent pages
        while (heightLeft > 0) {
            position -= pageHeight; // Shift image up
            pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${filename}.pdf`);
    } catch (err) {
        console.error('Error generating PDF:', err);
        throw err;
    }
};
