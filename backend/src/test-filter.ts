
const { IntentDetector } = require('./services/intentDetector');

const testCases = [
    "de que trata el tema 8 del bloque 2",
    "resumen del tema 1 bloque 1",
    "tema 5 del b3",
    "bloque 2 tema 3",
    "dame info del tema 10"
];

console.log("Testing IntentDetector Normalization:\n");

testCases.forEach(text => {
    const context = IntentDetector.detectContext(text);
    console.log(`Input: "${text}"`);
    console.log(`Detected:`, context);
    console.log("---");
});
