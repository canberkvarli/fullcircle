const functions = require('firebase-functions');
const Stripe = require('stripe');

// Test function to validate Stripe key
const testStripe = functions.https.onCall(async (data, context) => {
  try {
    // Use the hardcoded key for testing
    const stripe = Stripe('sk_test_51RlfjBKGi7kY2GqSYfSds6HOaydp3TwlM5Kvfa09ylq5g1e7Qu3R9pxsSEW4ivEWOubR6UdlPvMD07PESGoyivqf00kEp6uAF2');
    
    console.log('Testing Stripe with hardcoded key...');
    
    // Simple API call to test authentication
    const balance = await stripe.balance.retrieve();
    
    console.log('SUCCESS: Stripe API call worked');
    console.log('Balance:', balance);
    
    return {
      success: true,
      message: 'Stripe key is valid',
      available: balance.available,
      pending: balance.pending
    };
    
  } catch (error) {
    console.log('FAILED: Stripe API call failed');
    console.log('Error type:', error.type);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Status code:', error.statusCode);
    
    return {
      success: false,
      error: error.message,
      type: error.type,
      statusCode: error.statusCode
    };
  }
});

module.exports = { testStripe };