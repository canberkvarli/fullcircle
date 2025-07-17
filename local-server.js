// local-server.js - Simple test server
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint to verify Stripe connection
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment server is running!',
    stripeConnected: !!process.env.STRIPE_SECRET_KEY
  });
});

// Sacred Radiance purchase endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', userId, productType, boostCount } = req.body;

    console.log('🔮 Creating Sacred Radiance payment:', { 
      amount, 
      userId, 
      boostCount 
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId,
        productType,
        boostCount: boostCount.toString(),
      },
      description: `${boostCount} Sacred Radiance Boost${boostCount > 1 ? 's' : ''}`,
    });

    console.log('✅ Payment intent created:', paymentIntent.id);
    console.log('📤 Sending response with client_secret:', paymentIntent.client_secret ? 'Present' : 'Missing');

    const responseData = {
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// FullCircle subscription endpoint
app.post('/api/create-subscription-intent', async (req, res) => {
  try {
    const { userId, planType, amount } = req.body;

    console.log('🌟 Creating FullCircle subscription:', { 
      userId, 
      planType, 
      amount 
    });

    if (!userId || !planType || !amount) {
      throw new Error('Missing required fields: userId, planType, or amount');
    }

    // Create or retrieve customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        metadata: { userId },
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('👤 Found existing customer:', customer.id);
      } else {
        customer = await stripe.customers.create({
          metadata: { userId },
          description: `FullCircle User ${userId}`,
        });
        console.log('👤 Created new customer:', customer.id);
      }
    } catch (customerError) {
      console.log('⚠️ Customer creation/lookup failed, trying alternative approach');
      // Fallback: create customer without metadata lookup
      customer = await stripe.customers.create({
        description: `FullCircle User ${userId}`,
        metadata: { userId }
      });
      console.log('👤 Created fallback customer:', customer.id);
    }

    // Create price for the subscription
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: planType === 'yearly' ? 'year' : 'month',
      },
      product_data: {
        name: `FullCircle ${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
        description: 'Premium spiritual dating app features',
      },
    });

    console.log('💰 Created price:', price.id);

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('✅ Subscription created:', subscription.id);

    res.json({
      client_secret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('❌ Subscription error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message,
      type: error.type,
      code: error.code 
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Payment server running on http://localhost:${PORT}`);
  console.log('🔑 Stripe key loaded:', process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No');
});

module.exports = app;