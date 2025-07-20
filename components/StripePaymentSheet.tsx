// components/StripePaymentSheet.tsx - Debug Version
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useUserContext } from '@/context/UserContext';

interface StripePaymentSheetProps {
  boostCount: 1 | 3 | 5;
  onPaymentSuccess: (boostCount: number) => void;
  onPaymentCancel?: () => void;
}

export default function StripePaymentSheet({ 
  boostCount, 
  onPaymentSuccess, 
  onPaymentCancel 
}: StripePaymentSheetProps) {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { purchaseRadiance, confirmRadiancePayment } = useUserContext();

  const pricing = {
    1: { price: 9.99, description: '1 Sacred Radiance Boost' },
    3: { price: 26.97, description: '3 Sacred Radiance Boosts (Save 10%)' },
    5: { price: 39.95, description: '5 Sacred Radiance Boosts (Save 20%)' }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting payment process...');

      // Step 1: Create payment intent
      console.log('💳 Creating payment intent...');
      const { clientSecret, paymentIntentId } = await purchaseRadiance(boostCount);
      console.log('✅ Payment intent created:', paymentIntentId);
      console.log('🔑 Client secret received:', clientSecret ? 'Yes' : 'No');

      // Step 2: Initialize payment sheet with debug
      console.log('🎨 Initializing payment sheet...');
      const initResult = await initPaymentSheet({
        merchantDisplayName: 'FullCircle',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'FullCircle Customer',
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'fullcircle://payment-return',
        appearance: {
          colors: {
            primary: '#007AFF',
          },
        },
      });

      console.log('🎨 Payment sheet init result:', JSON.stringify(initResult, null, 2));

      if (initResult.error) {
        console.error('❌ Payment sheet initialization failed:', initResult.error);
        Alert.alert('Initialization Error', `Failed to initialize payment: ${initResult.error.message}`);
        return;
      }

      console.log('✅ Payment sheet initialized successfully');

      // Step 3: Present payment sheet with debug
      console.log('📱 Presenting payment sheet...');
      const presentResult = await presentPaymentSheet();
      
      console.log('📱 Payment sheet present result:', JSON.stringify(presentResult, null, 2));

      if (presentResult.error) {
        if (presentResult.error.code === 'Canceled') {
          console.log('👤 Payment was canceled by user');
          onPaymentCancel?.();
        } else {
          console.error('❌ Payment failed:', presentResult.error);
          Alert.alert('Payment Failed', presentResult.error.message);
        }
        return;
      }

      console.log('✅ Payment completed successfully!');

      // Step 4: Confirm payment on backend
      console.log('🔄 Confirming payment with backend...');
      await confirmRadiancePayment(paymentIntentId);
      console.log('✅ Payment confirmed with backend');

      // Step 5: Success!
      Alert.alert(
        'Payment Successful! 🎉',
        `You've received ${boostCount} Sacred Radiance Boost${boostCount > 1 ? 's' : ''}!`,
        [{ text: 'Awesome!', onPress: () => onPaymentSuccess(boostCount) }]
      );

    } catch (error: any) {
      console.error('💥 Payment error:', error);
      console.error('💥 Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Payment Error',
        error.message || 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
      console.log('🏁 Payment process completed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.priceCard}>
        <Text style={styles.title}>{pricing[boostCount].description}</Text>
        <Text style={styles.price}>${pricing[boostCount].price}</Text>
        <Text style={styles.subtitle}>
          Enhance your spiritual journey with Sacred Radiance
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Processing...' : `Purchase for $${pricing[boostCount].price}`}
        </Text>
      </TouchableOpacity>

      <Text style={styles.secureText}>
        🔒 Secure payment powered by Stripe
      </Text>
      
      {/* Debug info */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Debug: Loading = {loading.toString()}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  priceCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secureText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});