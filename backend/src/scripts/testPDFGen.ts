import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const testPDFGen = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    page.drawText('Test PDF Generation');
    
    const pdfBytes = await doc.save();
    const outputPath = path.join(__dirname, 'test.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    console.log('PDF created at:', outputPath);
};

testPDFGen();
