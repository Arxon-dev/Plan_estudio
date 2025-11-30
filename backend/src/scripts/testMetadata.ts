
import path from 'path';

const parseMetadata = (filePath: string) => {
    const filename = path.basename(filePath);
    const dir = path.dirname(filePath);
    const dirs = dir.split(path.sep);

    console.log(`Testing path: ${filePath}`);
    console.log(`Dirs: ${JSON.stringify(dirs)}`);

    let bloque = dirs.find(d => d.match(/^B\d+$/) || d.startsWith('Bloque')) || 'Desconocido';
    let tema = dirs.find(d => d.startsWith('Tema')) || 'Desconocido';

    if (bloque === 'Desconocido' || tema === 'Desconocido') {
        const parts = filename.replace('.txt', '').split('_');
        if (bloque === 'Desconocido') bloque = parts.find(p => p.startsWith('Bloque')) || 'Desconocido';
        if (tema === 'Desconocido') tema = parts.find(p => p.startsWith('Tema')) || 'Desconocido';
    }

    let documento = filename.replace('.txt', '');
    documento = documento.replace(/^Tema\s*\d+[\.\-]\s*/i, '');

    return { bloque, tema, documento };
};

const testPaths = [
    'e:\\OpoMelilla_2025\\Plan_estudio\\backend\\Doc\\TEMARIO TXT\\B1\\Tema_1\\Tema 1. Constitución Española de 1978. Títulos III, IV, V, VI y VIII.txt',
    'e:\\OpoMelilla_2025\\Plan_estudio\\backend\\Doc\\TEMARIO TXT\\B2\\Tema_1\\Tema 1. Parte 1. Ley 8_2006, Tropa y Marinería.txt',
    'e:\\OpoMelilla_2025\\Plan_estudio\\backend\\Doc\\TEMARIO TXT\\B3\\Tema_7\\Tema 7. España y su participación en Misiones Internacionales.txt'
];

testPaths.forEach(p => {
    console.log(parseMetadata(p));
    console.log('---');
});
