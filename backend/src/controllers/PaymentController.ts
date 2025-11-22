import { Request, Response } from 'express';
import { StripeService } from '../services/StripeService';

export class PaymentController {
    static async createCheckoutSession(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id; // Assuming auth middleware populates req.user
            const { priceId } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!priceId) {
                return res.status(400).json({ message: 'Price ID is required' });
            }

            const sessionUrl = await StripeService.createCheckoutSession(userId, priceId);
            res.json({ url: sessionUrl });
        } catch (error: any) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({ message: error.message });
        }
    }

    static async createPortalSession(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const sessionUrl = await StripeService.createPortalSession(userId);
            res.json({ url: sessionUrl });
        } catch (error: any) {
            console.error('Error creating portal session:', error);
            res.status(500).json({ message: error.message });
        }
    }

    static async handleWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            return res.status(400).send('Missing stripe-signature header');
        }

        try {
            await StripeService.handleWebhook(signature, req.body); // Note: req.body needs to be raw buffer for webhook verification
            res.json({ received: true });
        } catch (error: any) {
            console.error('Webhook Error:', error.message);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }
}
