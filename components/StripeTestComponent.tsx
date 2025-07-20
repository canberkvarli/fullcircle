// components/StripeTestComponent.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FUNCTIONS } from '../services/FirebaseConfig';

export default function StripeTestComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testStripeConnection = async () => {
    setLoading(true);
    setResult('Testing Stripe connection...');
    
    try {
      console.log('🧪 Starting Stripe test...');
      
      // Test the hardcoded function first
      const testFunction = FUNCTIONS.httpsCallable('testStripe');
      const response:any = await testFunction();
      
      console.log('✅ Function response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        setResult(`✅ SUCCESS!\nMessage: ${response.data.message}\nBalance: ${JSON.stringify(response.data.available || 'N/A')}`);
        Alert.alert('Success!', 'Stripe connection working perfectly!');
      } else {
        setResult(`❌ FAILED\nError: ${response.data.error}\nType: ${response.data.type}`);
        Alert.alert('Stripe Error', response.data.error);
      }
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      
      setResult(`❌ EXCEPTION\nMessage: ${error.message}\nCode: ${error.code}\nDetails: ${JSON.stringify(error.details || 'None')}`);
      Alert.alert('Connection Error', `Failed to call function: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const debugStripeKey = async () => {
    setLoading(true);
    setResult('Debugging Stripe key...');
    
    try {
      console.log('🔍 Debugging Stripe key...');
      
      const debugFunction = FUNCTIONS.httpsCallable('debugStripeKey');
      const response: any = await debugFunction();
      
      console.log('✅ Debug response:', response.data);
      
      if (response.data.success) {
        setResult(`✅ STRIPE KEY WORKING!\nSource: ${response.data.source}\nKey Length: ${response.data.keyLength}\nBalance: ${JSON.stringify(response.data.balance)}`);
        Alert.alert('Success!', `Stripe key works! Source: ${response.data.source}`);
      } else {
        setResult(`❌ STRIPE KEY DEBUG FAILED\nError: ${response.data.error}\nFunction Config: ${response.data.functionConfigExists}\nEnv Var: ${response.data.envVarExists}`);
        Alert.alert('Debug Failed', response.data.error);
      }
      
    } catch (error: any) {
      console.error('❌ Debug failed:', error);
      setResult(`❌ DEBUG EXCEPTION\nMessage: ${error.message}\nCode: ${error.code}`);
      Alert.alert('Debug Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentCreation = async () => {
    setLoading(true);
    setResult('Testing payment creation...');
    
    try {
      console.log('🧪 Testing payment creation...');
      
      const createPaymentFunction = FUNCTIONS.httpsCallable('createRadiancePayment');
      const response: any = await createPaymentFunction({ boostCount: 1 });
      
      console.log('✅ Payment response:', response.data);
      
      if (response.data.clientSecret) {
        setResult(`✅ PAYMENT INTENT CREATED!\nClient Secret: ${response.data.clientSecret.substring(0, 20)}...\nAmount: ${response.data.amount / 100}\nPayment ID: ${response.data.paymentIntentId}`);
        Alert.alert('Success!', 'Payment intent created successfully!');
      } else {
        setResult(`❌ NO CLIENT SECRET\nResponse: ${JSON.stringify(response.data)}`);
        Alert.alert('Error', 'No client secret returned');
      }
      
    } catch (error: any) {
      console.error('❌ Payment test failed:', error);
      setResult(`❌ PAYMENT FAILED\nMessage: ${error.message}\nCode: ${error.code}`);
      Alert.alert('Payment Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Stripe Integration Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.warningButton]} 
        onPress={debugStripeKey}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '⏳ Debugging...' : '🔍 Debug Stripe Key'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={testStripeConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '⏳ Testing...' : '🔌 Test Stripe Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={testPaymentCreation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '⏳ Testing...' : '💳 Test Payment Creation'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Test Result:</Text>
        <Text style={styles.resultText}>{result || 'No test run yet'}</Text>
      </View>
      
      <Text style={styles.instructions}>
        Run the first test to check if Firebase Functions can connect to Stripe. 
        If that works, try the payment creation test.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 120,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    color: '#495057',
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },
  instructions: {
    marginTop: 20,
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});