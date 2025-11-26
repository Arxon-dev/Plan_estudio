const path = require('path');
const tsConfig = require('../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

const baseUrl = path.resolve(__dirname, '..');

tsConfigPaths.register({
    baseUrl: baseUrl,
    paths: tsConfig.compilerOptions.paths
});

require('ts-node').register({
    files: true,
    transpileOnly: true,
    project: path.resolve(__dirname, '../tsconfig.json')
});

try {
    const { StudyPlanService } = require('../src/services/StudyPlanService');
    console.log('✅ StudyPlanService imported successfully');
    console.log('Methods:', Object.getOwnPropertyNames(StudyPlanService));
} catch (error) {
    console.error('❌ Error importing StudyPlanService:', error);
    process.exit(1);
}
