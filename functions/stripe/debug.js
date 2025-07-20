// functions/stripe/debug.js - Add this temporarily
const functions = require('firebase-functions');

const debugStripeKey = functions.https.onCall(async (data, context) => {
  try {
    console.log('=== STRIPE KEY DEBUG ===');
    
    // Check all possible sources
    const functionConfig = functions.config().stripe?.secret_key;
    const envVar = process.env.STRIPE_SECRET_KEY;
    
    console.log('Functions config key exists:', !!functionConfig);
    console.log('Environment variable exists:', !!envVar);
    
    if (functionConfig) {
      console.log('Functions config key length:', functionConfig.length);
      console.log('Functions config key starts with:', functionConfig.substring(0, 20));
      console.log('Functions config key ends with:', functionConfig.substring(functionConfig.length - 10));
      console.log('Functions config key (full for debug):', functionConfig);
    }
    
    if (envVar) {
      console.log('Env var key length:', envVar.length);
      console.log('Env var key starts with:', envVar.substring(0, 20));
      console.log('Env var key ends with:', envVar.substring(envVar.length - 10));
    }
    
    // Test the raw key
    const Stripe = require('stripe');
    
    // Test with functions config
    if (functionConfig) {
      console.log('Testing functions config key...');
      try {
        const stripeFunctionConfig = Stripe(functionConfig);
        const balance = await stripeFunctionConfig.balance.retrieve();
        console.log('✅ Functions config key works!');
        return {
          success: true,
          source: 'functions.config()',
          keyLength: functionConfig.length,
          balance: balance.available
        };
      } catch (error) {
        console.log('❌ Functions config key failed:', error.message);
      }
    }
    
    // Test with env var
    if (envVar) {
      console.log('Testing env var key...');
      try {
        const stripeEnv = Stripe(envVar);
        const balance = await stripeEnv.balance.retrieve();
        console.log('✅ Env var key works!');
        return {
          success: true,
          source: 'process.env',
          keyLength: envVar.length,
          balance: balance.available
        };
      } catch (error) {
        console.log('❌ Env var key failed:', error.message);
      }
    }
    
    return {
      success: false,
      error: 'No working key found',
      functionConfigExists: !!functionConfig,
      envVarExists: !!envVar
    };
    
  } catch (error) {
    console.error('Debug function error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

module.exports = { debugStripeKey };