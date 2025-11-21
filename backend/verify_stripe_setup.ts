import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const secretKey = process.env.STRIPE_SECRET_KEY;
const providedId = process.env.STRIPE_PREMIUM_PRICE_ID;

if (!secretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY is missing in .env');
    process.exit(1);
}

const stripe = new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
});

async function verify() {
    console.log('🔍 Verifying Stripe Configuration...');

    // 1. Check Mode (Live vs Test)
    if (secretKey?.startsWith('sk_live_')) {
        console.warn('⚠️  WARNING: You are using LIVE (Production) keys. Real money will be charged.');
    } else if (secretKey?.startsWith('sk_test_')) {
        console.log('✅ Using TEST keys. Safe for testing.');
    } else {
        console.error('❌ Unknown key format.');
    }

    // 2. Verify Price/Product ID
    if (!providedId) {
        console.error('❌ STRIPE_PREMIUM_PRICE_ID is missing in .env');
        return;
    }

    console.log(`\nChecking ID: ${providedId}`);

    try {
        // Try retrieving as Price first
        try {
            const price = await stripe.prices.retrieve(providedId);
            console.log('✅ Valid PRICE ID found:', price.id);
            console.log(`   Amount: ${(price.unit_amount! / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
            return;
        } catch (e) {
            // Not a price, maybe a product?
        }

        // Try retrieving as Product
        const product = await stripe.products.retrieve(providedId);
        console.log('ℹ️  Found PRODUCT ID, not Price ID.');
        console.log(`   Product Name: ${product.name}`);

        // Fetch prices for this product
        const prices = await stripe.prices.list({ product: providedId, active: true });

        if (prices.data.length > 0) {
            console.log('\n✅ Found valid PRICES for this product. Please use one of these in your .env:');
            prices.data.forEach(p => {
                console.log(`   - ID: ${p.id}  |  Amount: ${(p.unit_amount! / 100).toFixed(2)} ${p.currency.toUpperCase()} (${p.recurring?.interval})`);
            });
        } else {
            console.error('❌ This product has no active prices. Please create a price in Stripe Dashboard.');
        }

    } catch (error: any) {
        console.error('❌ Error retrieving ID:', error.message);

        // List all prices to help find the correct one
        console.log('\n📋 Listing ALL active prices in Test Mode:');
        const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] });
        prices.data.forEach(p => {
            const product = p.product as Stripe.Product;
            console.log(`   - Product: ${product.name} | Price ID: ${p.id} | Amount: ${(p.unit_amount! / 100).toFixed(2)} ${p.currency.toUpperCase()}`);
        });
    }
}

verify();
