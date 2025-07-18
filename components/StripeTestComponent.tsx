import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useUserContext } from '@/context/UserContext';

const StripeTestComponent = () => {
  const { testStripeConnection, createRadiancePaymentIntent } = useUserContext();

  const handleTestStripe = async () => {
    try {
      await testStripeConnection();
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const handleTestPayment = async () => {
    try {
      const result = await createRadiancePaymentIntent(1);
      Alert.alert(
        "Payment Intent Created! 💳",
        `Client Secret: ${result.clientSecret.substring(0, 20)}...`,
        [{ text: "Nice!", style: "default" }]
      );
    } catch (error) {
      console.error('Payment test failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleTestStripe}>
        <Text style={styles.buttonText}>🧪 Test Stripe Connection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleTestPayment}>
        <Text style={styles.buttonText}>💳 Test Payment Intent</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#6B73FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StripeTestComponent;