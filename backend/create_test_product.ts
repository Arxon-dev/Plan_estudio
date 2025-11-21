import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY missing');
    process.exit(1);
}

const stripe = new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
});

async function createProduct() {
    try {
        console.log('🚀 Creating Test Product and Price...');

        const product = await stripe.products.create({
            name: 'Suscripción Premium (Test)',
            description: 'Acceso completo a OpoMelilla (Entorno de Pruebas)',
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 1000, // 10.00 EUR
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
        });

        console.log('\n✅ SUCCESS!');
        console.log(`Product ID: ${product.id}`);
        console.log(`Price ID:   ${price.id}`);
        console.log('---------------------------------------------------');
        console.log('PLEASE COPY THIS PRICE ID INTO YOUR .ENV FILE');
    } catch (error: any) {
        console.error('❌ Error creating product:', error.message);
    }
}

createProduct();
