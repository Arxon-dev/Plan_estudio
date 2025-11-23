import axios from 'axios';

async function verifyPlans() {
    try {
        const response = await axios.get('http://localhost:3000/api/marketing/pricing');
        const plans = response.data.plans;

        if (plans && plans.length > 0) {
            console.log('First plan features type:', typeof plans[0].features);
            console.log('First plan features value:', plans[0].features);
            console.log('Is array?', Array.isArray(plans[0].features));
        } else {
            console.log('No plans found');
        }
    } catch (error) {
        console.error('Error fetching plans:', error);
    }
}

verifyPlans();
