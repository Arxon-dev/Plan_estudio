import { Request, Response } from 'express';
import SubscriptionPlan from '@models/SubscriptionPlan';
import MarketingSection from '@models/MarketingSection';

export class MarketingController {
    // --- Public Methods ---

    static async getPricingPageData(req: Request, res: Response): Promise<void> {
        try {
            const plans = await SubscriptionPlan.findAll({
                where: { isActive: true },
                order: [['order', 'ASC']],
            });

            const sections = await MarketingSection.findAll({
                where: { page: 'pricing', isActive: true },
            });

            // Convert sections array to object keyed by sectionId
            const sectionsMap = sections.reduce((acc: any, section) => {
                acc[section.sectionId] = section.content;
                return acc;
            }, {});

            // Parse features if they are strings (SQLite/MySQL JSON compatibility)
            const formattedPlans = plans.map((plan: any) => {
                const plainPlan = plan.get({ plain: true });
                if (typeof plainPlan.features === 'string') {
                    try {
                        plainPlan.features = JSON.parse(plainPlan.features);
                    } catch (e) {
                        plainPlan.features = [];
                    }
                }
                return plainPlan;
            });

            res.json({
                plans: formattedPlans,
                sections: sectionsMap,
            });
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            res.status(500).json({ message: 'Error al obtener datos de precios' });
        }
    }

    // --- Admin Methods: Plans ---

    static async getAllPlans(req: Request, res: Response): Promise<void> {
        try {
            const plans = await SubscriptionPlan.findAll({
                order: [['order', 'ASC']],
            });
            res.json(plans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            res.status(500).json({ message: 'Error al obtener planes' });
        }
    }

    static async createPlan(req: Request, res: Response): Promise<void> {
        try {
            const plan = await SubscriptionPlan.create(req.body);
            res.status(201).json(plan);
        } catch (error) {
            console.error('Error creating plan:', error);
            res.status(500).json({ message: 'Error al crear plan' });
        }
    }

    static async updatePlan(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const plan = await SubscriptionPlan.findByPk(id);

            if (!plan) {
                res.status(404).json({ message: 'Plan no encontrado' });
                return;
            }

            await plan.update(req.body);
            res.json(plan);
        } catch (error) {
            console.error('Error updating plan:', error);
            res.status(500).json({ message: 'Error al actualizar plan' });
        }
    }

    static async deletePlan(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const plan = await SubscriptionPlan.findByPk(id);

            if (!plan) {
                res.status(404).json({ message: 'Plan no encontrado' });
                return;
            }

            await plan.destroy();
            res.json({ message: 'Plan eliminado' });
        } catch (error) {
            console.error('Error deleting plan:', error);
            res.status(500).json({ message: 'Error al eliminar plan' });
        }
    }

    static async reorderPlans(req: Request, res: Response): Promise<void> {
        try {
            const { orderedIds } = req.body; // Array of IDs in new order

            await Promise.all(orderedIds.map((id: number, index: number) =>
                SubscriptionPlan.update({ order: index + 1 }, { where: { id } })
            ));

            res.json({ message: 'Orden actualizado' });
        } catch (error) {
            console.error('Error reordering plans:', error);
            res.status(500).json({ message: 'Error al reordenar planes' });
        }
    }

    // --- Admin Methods: Content ---

    static async getMarketingSections(req: Request, res: Response): Promise<void> {
        try {
            const { page } = req.query;
            const whereClause = page ? { page: String(page) } : {};

            const sections = await MarketingSection.findAll({
                where: whereClause,
            });
            res.json(sections);
        } catch (error) {
            console.error('Error fetching sections:', error);
            res.status(500).json({ message: 'Error al obtener secciones' });
        }
    }

    static async updateMarketingSection(req: Request, res: Response): Promise<void> {
        try {
            const { page, sectionId } = req.params;
            const { content, isActive } = req.body;

            let section = await MarketingSection.findOne({
                where: { page, sectionId }
            });

            if (section) {
                await section.update({ content, isActive });
            } else {
                section = await MarketingSection.create({
                    page,
                    sectionId,
                    content,
                    isActive: isActive ?? true
                });
            }

            res.json(section);
        } catch (error) {
            console.error('Error updating section:', error);
            res.status(500).json({ message: 'Error al actualizar sección' });
        }
    }
}
