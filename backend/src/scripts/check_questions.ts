
import { Op } from 'sequelize';
import TestQuestion from '../models/TestQuestion';
import sequelize from '../config/database';

const checkQuestions = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        console.log('Checking questions in database...');

        const questions = await TestQuestion.findAll({
            attributes: [
                'themeId',
                'themePart',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['themeId', 'themePart'],
            order: [['themeId', 'ASC'], ['themePart', 'ASC']]
        });

        console.log('Questions count by Theme and Part:');
        questions.forEach((q: any) => {
            console.log(`Theme ID: ${q.themeId}, Part: ${q.themePart || 'None'}, Count: ${q.get('count')}`);
        });

        console.log('\n--- Searching for recently created questions in Theme 1 ---');
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentQuestions = await TestQuestion.findAll({
            where: {
                themeId: 1,
                createdAt: { [Op.gte]: oneHourAgo }
            } as any,
            attributes: ['id', 'question', 'createdAt']
        });

        console.log(`Found ${recentQuestions.length} recent questions in Theme 1.`);
        if (recentQuestions.length > 0) {
            recentQuestions.forEach(q => {
                console.log(`[ID: ${q.id}] [Created: ${q.createdAt}] ${q.question.substring(0, 50)}...`);
            });
        }

    } catch (error) {
        console.error('Error checking questions:', error);
    } finally {
        process.exit();
    }
};

checkQuestions();
