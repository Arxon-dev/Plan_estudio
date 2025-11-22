import Stripe from 'stripe';
import User from '../models/User';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY no está configurada. Los pagos no funcionarán.');
}

const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-11-17.clover' as any,
});

export class StripeService {
    /**
     * Create a Stripe customer for a new user
     */
    static async createCustomer(email: string, name: string): Promise<string> {
        const customer = await stripe.customers.create({
            email,
            name,
        });
        return customer.id;
    }

    /**
     * Create a checkout session for subscription
     */
    static async createCheckoutSession(userId: number, priceId: string): Promise<string> {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        let customerId = user.stripeCustomerId;

        // If user doesn't have a stripe customer ID, create one
        if (!customerId) {
            customerId = await this.createCustomer(user.email, `${user.firstName} ${user.lastName}`);
            user.stripeCustomerId = customerId;
            await user.save();
        }

        // Check trial eligibility
        const isEligibleForTrial = !user.hasUsedTrial && !user.isPremium && !user.subscriptionStatus;

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
            metadata: {
                userId: userId.toString(),
            },
        };

        if (isEligibleForTrial) {
            sessionConfig.subscription_data = {
                trial_period_days: 7,
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return session.url || '';
    }

    /**
     * Create a portal session for customer to manage subscription
     */
    static async createPortalSession(userId: number): Promise<string> {
        const user = await User.findByPk(userId);
        if (!user || !user.stripeCustomerId) {
            throw new Error('User has no associated Stripe customer');
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`,
        });

        return session.url;
    }

    /**
     * Handle Stripe webhooks
     */
    static async handleWebhook(signature: string, payload: Buffer): Promise<void> {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) throw new Error('Stripe webhook secret not configured');

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        console.log(`🔔 Webhook received: '${event.type}'`);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.handleCheckoutCompleted(session);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                console.log(`✅ Handling subscription event: ${event.type}`);
                const subscription = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionUpdated(subscription);
                break;
            case 'invoice.payment_succeeded':
                console.log(`✅ Handling invoice payment success: ${event.type}`);
                const invoice = event.data.object as Stripe.Invoice;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const subscriptionField = (invoice as any).subscription;

                if (subscriptionField) {
                    const subscriptionId = typeof subscriptionField === 'string' ? subscriptionField : subscriptionField.id;
                    const sub = await stripe.subscriptions.retrieve(subscriptionId);
                    await this.handleSubscriptionUpdated(sub);
                }
                break;
            default:
                console.log(`⚠️ Unhandled event type: '${event.type}' (Length: ${event.type.length})`);
        }
    }

    private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const userId = session.metadata?.userId;
        if (!userId) return;

        const user = await User.findByPk(userId);
        if (!user) return;

        user.isPremium = true;
        user.subscriptionStatus = 'active';
        await user.save();
    }

    private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        const customerId = subscription.customer as string;
        const user = await User.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) return;

        user.subscriptionStatus = subscription.status as any;
        user.subscriptionEndDate = new Date((subscription as any).current_period_end * 1000);

        if (subscription.status === 'active' || subscription.status === 'trialing') {
            user.isPremium = true;
            // Mark trial as used if it's a trialing subscription
            if (subscription.status === 'trialing') {
                user.hasUsedTrial = true;
            }
        } else {
            user.isPremium = false;
        }

        await user.save();
    }
}
