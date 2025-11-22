
import { Op } from 'sequelize';
import TestQuestion from '../models/TestQuestion';
import sequelize from '../config/database';

const moveQuestions = async () => {
    const transaction = await sequelize.transaction();
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Move questions with explicit Theme 2 keywords
        const keywordQuestions = await TestQuestion.findAll({
            where: {
                themeId: 1,
                question: {
                    [Op.or]: [
                        { [Op.like]: '%Ley Orgánica 5/2005%' },
                        { [Op.like]: '%Defensa Nacional%' }
                    ]
                }
            } as any,
            transaction
        });

        if (keywordQuestions.length > 0) {
            console.log(`Found ${keywordQuestions.length} questions with Theme 2 keywords.`);
            await TestQuestion.update(
                { themeId: 2 },
                {
                    where: {
                        id: keywordQuestions.map(q => q.id)
                    },
                    transaction
                }
            );
            console.log('Moved keyword questions to Theme 2.');
        }

        // 2. Move questions with themePart (likely misplaced Theme 2 or 6)
        // We verified earlier that these are Ley 5/2005 questions
        const partQuestions = await TestQuestion.findAll({
            where: {
                themeId: 1,
                themePart: { [Op.ne]: null }
            } as any,
            transaction
        });

        if (partQuestions.length > 0) {
            console.log(`Found ${partQuestions.length} questions with themePart in Theme 1.`);
            await TestQuestion.update(
                { themeId: 2 },
                {
                    where: {
                        id: partQuestions.map(q => q.id)
                    },
                    transaction
                }
            );
            console.log('Moved themePart questions to Theme 2.');
        }

        await transaction.commit();
        console.log('Migration completed successfully.');

    } catch (error) {
        await transaction.rollback();
        console.error('Error moving questions:', error);
    } finally {
        process.exit();
    }
};

moveQuestions();
