import fs from 'fs';
import path from 'path';

const testTablePagination = async () => {
    console.log('Testing table pagination...');
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
};

testTablePagination();
