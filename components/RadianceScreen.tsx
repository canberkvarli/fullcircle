import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  Animated,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";
import { useStripe } from "@stripe/stripe-react-native";

const { width } = Dimensions.get('window');

interface BoostOptionProps {
  boostCount: number;
  pricePerBoost: number;
  totalPrice: number;
  savings?: number;
  isSelected: boolean;
  onSelect: () => void;
  tag?: string;
}

const BoostOption: React.FC<BoostOptionProps> = ({
  boostCount,
  pricePerBoost,
  totalPrice,
  savings,
  isSelected,
  onSelect,
  tag
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  return (
    <TouchableOpacity
      style={[
        styles.boostOption,
        { 
          backgroundColor: isSelected ? '#D4AF37' + '10' : colors.card,
          borderColor: isSelected ? '#B8860B' : '#D4AF37' + '40',
          borderWidth: 2
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {tag && (
        <View style={[styles.tagBadge, { backgroundColor: '#FF6B35' }]}>
          <Text style={[styles.tagText, fonts.spiritualBodyFont]}>{tag}</Text>
        </View>
      )}
      
      <View style={styles.boostHeader}>
        <View style={styles.boostIconContainer}>
          <Ionicons name="radio-outline" size={20} color="#B8860B" />
          <Text style={[styles.boostCount, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            {boostCount}
          </Text>
        </View>
      </View>

      <View style={styles.pricingContainer}>
        <Text style={[styles.pricePerBoost, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          ${pricePerBoost.toFixed(2)} each
        </Text>
        <Text style={[styles.totalPrice, fonts.spiritualTitleFont, { color: '#B8860B' }]}>
          ${totalPrice.toFixed(2)}
        </Text>
      </View>

      <View
        style={[
          styles.selectIndicator,
          { 
            backgroundColor: isSelected ? '#B8860B' : 'transparent',
            borderColor: isSelected ? '#B8860B' : '#D4AF37' + '60',
          }
        ]}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface RadianceScreenProps {
  visible: boolean;
  onClose: () => void;
}

const RadianceScreen: React.FC<RadianceScreenProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { 
    userData, 
    purchaseRadiance, 
    confirmRadiancePayment,
    activateRadiance, 
    getRadianceTimeRemaining,
    getRadianceStatus 
  } = useUserContext();
  
  const { presentPaymentSheet, initPaymentSheet } = useStripe();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [radianceStatus, setRadianceStatus] = useState({ 
    isActive: false, 
    timeRemaining: 0, 
    formattedTime: '00:00' 
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const boostOptions = [
    {
      boostCount: 1,
      pricePerBoost: 9.99,
      totalPrice: 9.99,
      tag: undefined
    },
    {
      boostCount: 3,
      pricePerBoost: 8.99,
      totalPrice: 26.97,
      tag: "Save 10%"
    },
    {
      boostCount: 5,
      pricePerBoost: 7.99,
      totalPrice: 39.95,
      tag: "Save 20%"
    }
  ];

  // Format time function
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  // Check radiance status
  useEffect(() => {
    const updateRadianceStatus = () => {
      let timeRemaining = 0;
      let isActive = false;

      if (getRadianceStatus) {
        const status = getRadianceStatus();
        isActive = status.isActive;
        timeRemaining = status.timeRemaining;
      } else if (getRadianceTimeRemaining) {
        timeRemaining = getRadianceTimeRemaining();
        isActive = timeRemaining > 0;
      }

      setRadianceStatus({
        isActive,
        timeRemaining,
        formattedTime: formatTime(timeRemaining)
      });
    };

    if (visible) {
      updateRadianceStatus();
      const interval = setInterval(updateRadianceStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [visible, getRadianceStatus, getRadianceTimeRemaining]);

  // Show alert when radiance is active
  useEffect(() => {
    if (visible && radianceStatus.isActive && radianceStatus.timeRemaining > 0) {
      const minutes = Math.floor(radianceStatus.timeRemaining / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      let timeText = "";
      if (hours > 0) {
        timeText = `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      } else {
        timeText = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }

      Alert.alert(
        "🌟 Radiance Active",
        `Your profile is being prioritized for the next ${timeText}! You're getting 11x more visibility and appearing first in discovery.`,
        [{ text: "Got it!", style: "default" }]
      );
    }
  }, [visible, radianceStatus.isActive]);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleActivateExistingBoost = async () => {
    if (!userData.activeBoosts || userData.activeBoosts < 1) {
      return;
    }

    setIsProcessing(true);
    try {
      await activateRadiance();
      
      Alert.alert(
        "Radiance Activated!",
        "Your profile is now being prioritized in discovery for the next hour. Get ready for 11x more connections!",
        [{ text: "Amazing!", style: "default" }]
      );
      
      onClose();
    } catch (error) {
      console.error('Activation failed:', error);
      Alert.alert(
        "Activation Failed",
        "We couldn't activate your Radiance right now. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 🚀 NEW: Handle Stripe Purchase
  const handlePurchase = async () => {
    setIsProcessing(true);
    const option = boostOptions[selectedOption];
    
    try {
      // 1. Create payment intent
      console.log('Creating payment intent...');
      const { clientSecret, paymentIntentId } = await purchaseRadiance(option.boostCount);
      
      // 2. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FullCircle',
        style: 'alwaysDark',
      });

      if (initError) {
        console.error('Payment sheet init failed:', initError);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }

      // 3. Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error('Payment failed:', paymentError);
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message || 'Payment was not completed.');
        }
        return;
      }

      // 4. Confirm payment on backend
      console.log('Payment succeeded, confirming...');
      await confirmRadiancePayment(paymentIntentId);
      
      // 5. Show success
      Alert.alert(
        "🎉 Purchase Successful!",
        `You've received ${option.boostCount} Radiance boost${option.boostCount !== 1 ? 's' : ''}! Use them to get 11x more visibility and connections.`,
        [{ text: "Awesome!", style: "default" }]
      );
      
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert(
        "Purchase Failed",
        "We couldn't complete your purchase right now. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine what to show
  const hasActiveRadiance = radianceStatus.isActive;
  const hasAvailableBoosts = (userData.activeBoosts || 0) > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Radiance Status */}
          {hasActiveRadiance && (
            <View style={styles.activeRadianceSection}>
              <View style={[styles.activeRadianceCard, { backgroundColor: '#D4AF37' + '08', borderColor: '#B8860B' }]}>
                <View style={styles.activeRadianceHeader}>
                  <Ionicons name="radio" size={24} color="#B8860B" />
                  <Text style={[styles.activeRadianceTitle, fonts.spiritualTitleFont, { color: '#B8860B' }]}>
                    Radiance Active
                  </Text>
                </View>
                <Text style={[styles.activeRadianceTime, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  {radianceStatus.formattedTime}
                </Text>
                <Text style={[styles.activeRadianceSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Your profile is being prioritized in discovery
                </Text>
                <Text style={[styles.activeRadianceBonus, fonts.spiritualBodyFont, { color: '#B8860B' }]}>
                  11x more visibility active!
                </Text>
              </View>
            </View>
          )}

          {/* Available Boosts to Activate */}
          {!hasActiveRadiance && hasAvailableBoosts && (
            <View style={styles.availableBoostsSection}>
              <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Activate Your Radiance
              </Text>
              <Text style={[styles.sectionSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                You have {userData.activeBoosts} boost{userData.activeBoosts !== 1 ? 's' : ''} ready to activate
              </Text>
              
              <View style={[styles.boostInfoCard, { backgroundColor: colors.card }]}>
                <Ionicons name="information-circle" size={20} color="#B8860B" />
                <Text style={[styles.boostInfoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Activating Radiance will boost your profile for 1 hour with 11x more visibility!
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.activateButton, { backgroundColor: '#B8860B', shadowColor: '#B8860B' }]}
                onPress={handleActivateExistingBoost}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <View style={styles.processingContainer}>
                    <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.activateButtonText, fonts.spiritualBodyFont]}>
                      Activating...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.activateContainer}>
                    <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.activateButtonText, fonts.spiritualBodyFont]}>
                      Activate for 1 Hour
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={[styles.orText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Or get more Radiance below
              </Text>
            </View>
          )}

          {/* Purchase Options */}
          {(!hasActiveRadiance || hasActiveRadiance) && (
            <>
              <View style={styles.purchaseSection}>
                <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  {hasActiveRadiance ? "Get More Radiance" : "Radiance"}
                </Text>
                <Text style={[styles.sectionSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Appear first in discovery and get 11x more connections
                </Text>
              </View>

              {/* Horizontal Boost Options */}
              <View style={styles.optionsSection}>
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.optionsScrollView}
                  snapToInterval={width * 0.7}
                  decelerationRate="fast"
                >
                  {boostOptions.map((option, index) => (
                    <BoostOption
                      key={index}
                      boostCount={option.boostCount}
                      pricePerBoost={option.pricePerBoost}
                      totalPrice={option.totalPrice}
                      tag={option.tag}
                      isSelected={selectedOption === index}
                      onSelect={() => setSelectedOption(index)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* How it Works */}
              <View style={styles.infoSection}>
                <Text style={[styles.infoTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  How It Works
                </Text>
                
                <View style={styles.infoList}>
                  <View style={styles.infoItem}>
                    <View style={[styles.infoIcon, { backgroundColor: '#D4AF37' + '15' }]}>
                      <Ionicons name="trending-up" size={16} color="#B8860B" />
                    </View>
                    <Text style={[styles.infoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                      Your profile appears first in discovery for 60 minutes
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <View style={[styles.infoIcon, { backgroundColor: '#D4AF37' + '15' }]}>
                      <Ionicons name="people" size={16} color="#B8860B" />
                    </View>
                    <Text style={[styles.infoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                      Get 11x more profile views from compatible souls
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <View style={[styles.infoIcon, { backgroundColor: '#D4AF37' + '15' }]}>
                      <Ionicons name="heart" size={16} color="#B8860B" />
                    </View>
                    <Text style={[styles.infoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                      Track radiance connections in Kindred Spirits
                    </Text>
                  </View>
                </View>
              </View>

              {/* Purchase Button */}
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  { 
                    backgroundColor: isProcessing ? colors.textMuted : '#B8860B',
                    shadowColor: '#B8860B'
                  }
                ]}
                onPress={handlePurchase}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <View style={styles.processingContainer}>
                    <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.purchaseButtonText, fonts.spiritualBodyFont]}>
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.purchaseContainer}>
                    <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.purchaseButtonText, fonts.spiritualBodyFont]}>
                      Get {boostOptions[selectedOption].boostCount} for ${boostOptions[selectedOption].totalPrice.toFixed(2)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Trust Indicators */}
              <View style={styles.trustSection}>
                <View style={styles.trustItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#B8860B" />
                  <Text style={[styles.trustText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                    Secure payment
                  </Text>
                </View>
                <View style={styles.trustItem}>
                  <Ionicons name="refresh" size={16} color="#B8860B" />
                  <Text style={[styles.trustText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                    Cancel anytime
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// Keep all your existing styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.select({ ios: 50, android: 30 }),
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  
  scrollView: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },

  // Active Radiance Section
  activeRadianceSection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  activeRadianceCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    alignItems: 'center',
  },

  activeRadianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  activeRadianceTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },

  activeRadianceTime: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },

  activeRadianceSubtext: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  activeRadianceBonus: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },

  // Available Boosts Section
  availableBoostsSection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },

  boostInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },

  boostInfoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
  },

  activateButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  activateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  activateButtonText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.lg,
  },

  orText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },

  // Purchase Section
  purchaseSection: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  sectionSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.4,
  },
  
  // Options Section - Horizontal
  optionsSection: {
    marginBottom: Spacing.xl,
  },

  optionsScrollView: {
    paddingLeft: Spacing.md,
    gap: Spacing.md,
  },
  
  boostOption: {
    width: width * 0.65,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    position: 'relative',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  tagBadge: {
    position: 'absolute',
    right: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  
  tagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  boostHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  boostIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  boostCount: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },
  
  pricingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  pricePerBoost: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  
  totalPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },

  selectIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Info Section
  infoSection: {
    marginBottom: Spacing.xl,
  },
  
  infoTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  
  infoList: {
    gap: Spacing.md,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  infoText: {
    fontSize: Typography.sizes.sm,
    flex: 1,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  
  // Purchase Button
  purchaseButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  purchaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  purchaseButtonText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.lg,
  },
  
  // Trust Section
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  trustText: {
    fontSize: Typography.sizes.sm,
  },
});

export default RadianceScreen;