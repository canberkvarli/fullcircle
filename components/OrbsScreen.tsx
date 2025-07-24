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
  Platform,
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
  popular?: boolean;
}

interface OrbsScreenProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (orbCount: number, totalPrice: number, transactionId: string) => void;
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
          shadowColor: isSelected ? '#8B4513' : colors.shadow,
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {option.popular && (
        <View style={[styles.popularBadge, { backgroundColor: '#8B4513' }]}>
          <Text style={[styles.popularText, fonts.captionFont]}>
            Most Popular
          </Text>
        </View>
      )}
      
      {option.tag && !option.popular && (
        <View style={[styles.saveBadge, { backgroundColor: colors.success }]}>
          <Text style={[styles.saveText, fonts.captionFont]}>
            {option.tag}
          </Text>
        </View>
      )}
      
      <View style={styles.orbDisplay}>
        <View style={[styles.orbIcon, { backgroundColor: '#8B4513' + '20' }]}>
          <Text style={[styles.orbCountText, fonts.spiritualTitleFont, { color: '#8B4513' }]}>
            {option.orbCount}
          </Text>
        </View>
        <Text style={[styles.orbLabel, fonts.bodyFont, { color: colors.textMuted }]}>
          orb{option.orbCount !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.priceDisplay}>
        <Text style={[styles.mainPrice, fonts.titleFont, { color: colors.textDark }]}>
          ${option.totalPrice.toFixed(2)}
        </Text>
        <Text style={[styles.unitPrice, fonts.captionFont, { color: colors.textMuted }]}>
          ${option.pricePerOrb.toFixed(2)} each
        </Text>
      </View>
      
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: '#8B4513' }]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}
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
  
  const [selectedOption, setSelectedOption] = useState<number>(1); // Default to middle option
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const scrollViewRef = useRef<ScrollView>(null);

  const orbOptions: OrbOption[] = [
    {
      orbCount: 1,
      pricePerOrb: 4.99,
      totalPrice: 4.99,
    },
    {
      orbCount: 3,
      pricePerOrb: 4.49,
      totalPrice: 13.47,
      tag: "Save 10%",
      popular: true,
    },
    {
      orbCount: 5,
      pricePerOrb: 3.99,
      totalPrice: 19.95,
      tag: "Save 20%",
    },
    {
      orbCount: 10,
      pricePerOrb: 3.49,
      totalPrice: 34.90,
      tag: "Save 30%",
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-scroll to popular option
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: 160, // Adjusted for wider cards
          animated: true,
        });
      }, 300);
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
        'Success! ✨',
        `You got ${selectedOrbOption.orbCount} cosmic orb${selectedOrbOption.orbCount !== 1 ? 's' : ''}!`,
        [
          {
            text: 'Nice!',
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
        {/* Floating Close Button */}
        <TouchableOpacity 
          style={[styles.floatingCloseButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onClose}
        >
          <Ionicons name="close" size={20} color={colors.textDark} />
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Simple Hero */}
            <View style={styles.heroSection}>
              <View style={[styles.currentOrbsDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="sparkles" size={18} color="#8B4513" />
                <Text style={[styles.currentOrbsText, fonts.bodyFont, { color: colors.textDark }]}>
                  {userData.numOfOrbs || 0} orbs
                </Text>
              </View>
              
              <Text style={[styles.heroTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Stand Out with Super Likes
              </Text>
              
              <Text style={[styles.heroSubtitle, fonts.bodyFont, { color: colors.textMuted }]}>
                Get priority placement and make meaningful connections
              </Text>
            </View>

            {/* Horizontal Scrolling Options */}
            <View style={styles.optionsSection}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsContainer}
                decelerationRate="fast"
                snapToInterval={156} // Adjusted for wider cards (140 + 16 gap)
                snapToAlignment="start"
              >
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
              </ScrollView>
            </View>

            {/* Simple Benefits */}
            <View style={styles.benefitsSection}>
              <View style={styles.benefitRow}>
                <Ionicons name="flash" size={16} color="#8B4513" />
                <Text style={[styles.benefitText, fonts.captionFont, { color: colors.textMuted }]}>
                  Priority placement
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <Ionicons name="heart" size={16} color="#8B4513" />
                <Text style={[styles.benefitText, fonts.captionFont, { color: colors.textMuted }]}>
                  Higher match rate
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <Ionicons name="notifications" size={16} color="#8B4513" />
                <Text style={[styles.benefitText, fonts.captionFont, { color: colors.textMuted }]}>
                  Instant notification
                </Text>
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
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              )}
              
              <Text style={[styles.purchaseButtonText, fonts.buttonFont]}>
                {isProcessing 
                  ? 'Processing...' 
                  : `Get ${orbOptions[selectedOption].orbCount} Orb${orbOptions[selectedOption].orbCount !== 1 ? 's' : ''} • $${orbOptions[selectedOption].totalPrice.toFixed(2)}`
                }
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.disclaimerText, fonts.captionFont, { color: colors.textMuted }]}>
              Secure payment by Stripe
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
  floatingCloseButton: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 30 }),
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.select({ ios: 80, android: 60 }),
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  currentOrbsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  currentOrbsText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.sm,
  },
  heroTitle: {
    fontSize: Typography.sizes.xl,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsSection: {
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md, // Add top padding for badge space
    gap: Spacing.md,
  },
  optionCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: Spacing.md, // Add top margin to prevent badge cutoff
  },
  popularBadge: {
    position: 'absolute',
    top: -29,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
  },
  saveBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
  },
  orbDisplay: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  orbIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orbCountText: {
    fontSize: Typography.sizes.lg,
  },
  orbLabel: {
    fontSize: Typography.sizes.xs,
  },
  priceDisplay: {
    alignItems: 'center',
  },
  mainPrice: {
    fontSize: Typography.sizes.sm,
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: 10,
  },
  selectedIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.sizes.sm,
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
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    marginLeft: Spacing.sm,
  },
  disclaimerText: {
    textAlign: 'center',
  },
});

export default OrbsScreen;