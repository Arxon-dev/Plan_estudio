require('dotenv').config({ path: 'backend/.env' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CUSTOMER_ID = 'cus_TT348kdlIueIJA'; // ID from DB check

async function checkStripeStatus() {
    try {
        console.log(`🔍 Checking Stripe status for customer: ${CUSTOMER_ID}`);

        const subscriptions = await stripe.subscriptions.list({
            customer: CUSTOMER_ID,
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            console.log('❌ No subscriptions found for this customer.');
        } else {
            const sub = subscriptions.data[0];
            console.log('✅ Subscription found!');
            console.log(`   - ID: ${sub.id}`);
            console.log(`   - Status: ${sub.status}`);
            console.log(`   - Current Period End: ${new Date(sub.current_period_end * 1000).toISOString()}`);
            console.log(`   - Trial End: ${sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : 'N/A'}`);
        }

    } catch (error) {
        console.error('❌ Error querying Stripe:', error.message);
    }
}

checkStripeStatus();
