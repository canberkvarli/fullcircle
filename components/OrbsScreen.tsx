import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  useColorScheme,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useUserContext } from '@/context/UserContext';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OrbOption {
  orbCount: number;
  pricePerOrb: number;
  totalPrice: number;
  tag?: string;
}

interface OrbsScreenProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (orbCount: number, totalPrice: number, transactionId: string) => void; // Add this
}

const OrbOptionCard: React.FC<{
  option: OrbOption;
  isSelected: boolean;
  onSelect: () => void;
  colorScheme: 'light' | 'dark';
  fonts: any;
}> = ({ option, isSelected, onSelect, colorScheme, fonts }) => {
  const colors = Colors[colorScheme];
  
  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        {
          backgroundColor: isSelected ? '#8B4513' + '15' : colors.card,
          borderColor: isSelected ? '#8B4513' : colors.border,
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {option.tag && (
        <View style={[styles.tagContainer, { backgroundColor: '#8B4513' }]}>
          <Text style={[styles.tagText, fonts.spiritualBodyFont]}>
            {option.tag}
          </Text>
        </View>
      )}
      
      <View style={styles.orbsContainer}>
        <View style={[styles.orbIcon, { backgroundColor: '#8B4513' + '20' }]}>
          <Ionicons name="sparkles" size={32} color="#8B4513" />
        </View>
        <Text style={[styles.orbCount, fonts.spiritualTitleFont, { color: colors.textDark }]}>
          {option.orbCount} Orb{option.orbCount !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={[styles.totalPrice, fonts.spiritualBodyFont, { color: colors.textDark }]}>
          ${option.totalPrice.toFixed(2)}
        </Text>
        <Text style={[styles.pricePerOrb, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
          ${option.pricePerOrb.toFixed(2)} per orb
        </Text>
      </View>
      
      <View style={[styles.selectionIndicator, { borderColor: isSelected ? '#8B4513' : colors.border }]}>
        {isSelected && (
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const OrbsScreen: React.FC<OrbsScreenProps> = ({ visible, onClose, onPurchaseSuccess }) => {
  const { 
    userData, 
    createOrbPaymentIntent,
    updateUserData
  } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const orbOptions: OrbOption[] = [
    {
      orbCount: 1,
      pricePerOrb: 4.99,
      totalPrice: 4.99,
      tag: undefined
    },
    {
      orbCount: 3,
      pricePerOrb: 4.49,
      totalPrice: 13.47,
      tag: "Save 10%"
    },
    {
      orbCount: 5,
      pricePerOrb: 3.99,
      totalPrice: 19.95,
      tag: "Save 20%"
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      
      const selectedOrbOption = orbOptions[selectedOption];
      console.log('🚀 Starting orb purchase:', selectedOrbOption);

      // Step 1: Create payment intent
      const paymentData = await createOrbPaymentIntent(selectedOrbOption.orbCount);
      console.log('✅ Payment intent created:', paymentData);

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'FullCircle',
        paymentIntentClientSecret: paymentData.clientSecret,
        defaultBillingDetails: {
          name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'fullcircle://payment-success',
      });

      if (initError) {
        console.error('❌ Payment sheet init error:', initError);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }

      console.log('✅ Payment sheet initialized');

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          console.log('Payment canceled by user');
          return;
        }
        console.error('❌ Payment error:', presentError);
        Alert.alert('Payment Failed', presentError.message);
        return;
      }

      console.log('✅ Payment completed successfully!');

      // Step 4: Update local state immediately using updateUserData
      console.log(`🎯 Updating local state: adding ${selectedOrbOption.orbCount} orbs`);
      
      // Create purchase record
      const purchase = {
        orbCount: selectedOrbOption.orbCount,
        totalPrice: selectedOrbOption.totalPrice,
        purchaseDate: new Date(),
        transactionId: paymentData.paymentIntentId,
        stripePaymentIntentId: paymentData.paymentIntentId,
        status: 'succeeded' as const
      };
      
      // Update using your existing updateUserData method
      await updateUserData({
        numOfOrbs: (userData.numOfOrbs || 0) + selectedOrbOption.orbCount,
        orbPurchases: [...(userData.orbPurchases || []), purchase]
      });
      
      Alert.alert(
        'Orbs Purchased! ✨',
        `You successfully purchased ${selectedOrbOption.orbCount} cosmic orb${selectedOrbOption.orbCount !== 1 ? 's' : ''} for $${selectedOrbOption.totalPrice.toFixed(2)}. Use them to make powerful connections!`,
        [
          {
            text: 'Amazing!',
            onPress: onClose
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Cosmic Orbs
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={[styles.heroIcon, { backgroundColor: '#8B4513' + '20' }]}>
                <Ionicons name="sparkles" size={48} color="#8B4513" />
              </View>
              
              <Text style={[styles.heroTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Super Likes with Cosmic Energy
              </Text>
              
              <Text style={[styles.heroSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Stand out from the crowd and make meaningful connections with cosmic orbs. 
                Your profile gets special cosmic energy that draws the right people to you.
              </Text>

              {/* Current Orbs Display */}
              <View style={[styles.currentOrbsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.currentOrbsIcon, { backgroundColor: '#8B4513' + '15' }]}>
                  <Ionicons name="sparkles" size={20} color="#8B4513" />
                </View>
                <Text style={[styles.currentOrbsText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                  You have {userData.numOfOrbs || 0} cosmic orb{(userData.numOfOrbs || 0) !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Orb Options */}
            <View style={styles.optionsSection}>
              <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Choose Your Cosmic Power
              </Text>
              
              <View style={styles.optionsGrid}>
                {orbOptions.map((option, index) => (
                  <OrbOptionCard
                    key={index}
                    option={option}
                    isSelected={selectedOption === index}
                    onSelect={() => setSelectedOption(index)}
                    colorScheme={colorScheme}
                    fonts={fonts}
                  />
                ))}
              </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Cosmic Orb Benefits
              </Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#8B4513' + '20' }]}>
                    <Ionicons name="star" size={16} color="#8B4513" />
                  </View>
                  <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                    Stand out with cosmic energy aura
                  </Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#8B4513' + '20' }]}>
                    <Ionicons name="flash" size={16} color="#8B4513" />
                  </View>
                  <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                    Priority placement in their queue
                  </Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#8B4513' + '20' }]}>
                    <Ionicons name="heart" size={16} color="#8B4513" />
                  </View>
                  <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                    Higher connection success rate
                  </Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#8B4513' + '20' }]}>
                    <Ionicons name="notifications" size={16} color="#8B4513" />
                  </View>
                  <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                    Instant notification to recipient
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Purchase Button */}
          <View style={[styles.purchaseSection, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                { 
                  backgroundColor: isProcessing ? colors.textMuted : '#8B4513',
                  opacity: isProcessing ? 0.7 : 1
                }
              ]}
              onPress={handlePurchase}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              )}
              
              <Text style={[styles.purchaseButtonText, fonts.spiritualBodyFont]}>
                {isProcessing 
                  ? 'Processing...' 
                  : `Get ${orbOptions[selectedOption].orbCount} Orb${orbOptions[selectedOption].orbCount !== 1 ? 's' : ''} - $${orbOptions[selectedOption].totalPrice.toFixed(2)}`
                }
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.disclaimerText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
              Secure payment powered by Stripe
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.5,
    marginBottom: Spacing.lg,
    letterSpacing: 0.2,
  },
  currentOrbsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  currentOrbsIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  currentOrbsText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  optionsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
    letterSpacing: 0.3,
  },
  optionsGrid: {
    gap: Spacing.md,
  },
  optionCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagContainer: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  orbsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orbIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  orbCount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  totalPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  pricePerOrb: {
    fontSize: Typography.sizes.sm,
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B4513',
  },
  benefitsSection: {
    marginBottom: Spacing.xl,
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  benefitText: {
    fontSize: Typography.sizes.base,
    flex: 1,
  },
  purchaseSection: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
    letterSpacing: 0.3,
  },
  disclaimerText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default OrbsScreen;