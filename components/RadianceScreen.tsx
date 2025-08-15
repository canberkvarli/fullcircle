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
import OuroborosLoader from "./ouroboros/OuroborosLoader";
import { CustomIcon } from "./CustomIcon";

const { width } = Dimensions.get('window');

interface BoostOptionProps {
  boostCount: number;
  pricePerBoost: number;
  totalPrice: number;
  savings?: number;
  isSelected: boolean;
  onSelect: () => void;
  tag?: string;
  popular?: boolean;
}

const BoostOption: React.FC<BoostOptionProps> = ({
  boostCount,
  pricePerBoost,
  totalPrice,
  savings,
  isSelected,
  onSelect,
  tag,
  popular
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  return (
    <TouchableOpacity
      style={[
        styles.boostOption,
        { 
          backgroundColor: isSelected ? '#B8860B' + '15' : colors.card,
          borderColor: isSelected ? '#B8860B' : colors.border,
          shadowColor: isSelected ? '#B8860B' : colors.shadow,
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {popular && (
        <View style={[styles.popularBadge, { backgroundColor: '#B8860B' }]}>
          <Text style={[styles.popularText, fonts.captionFont]}>
            Most Popular
          </Text>
        </View>
      )}
      
      {tag && !popular && (
        <View style={[styles.saveBadge, { backgroundColor: colors.success }]}>
          <Text style={[styles.saveText, fonts.captionFont]}>
            {tag}
          </Text>
        </View>
      )}
      
      <View style={styles.boostDisplay}>
        <View style={[styles.boostIcon, { backgroundColor: '#B8860B' + '20' }]}>
          <Text style={[styles.boostCountText, fonts.spiritualLargeTitleFont, { color: '#B8860B' }]}>
            {boostCount}
          </Text>
        </View>
        <Text style={[styles.boostLabel, fonts.bodyFont, { color: colors.textMuted }]}>
          Radiance{boostCount !== 1 ? '' : ''}
        </Text>
      </View>

      <View style={styles.pricingContainer}>
        <Text style={[styles.totalPrice, fonts.titleFont, { color: colors.textDark }]}>
          ${totalPrice.toFixed(2)}
        </Text>
        <Text style={[styles.pricePerBoost, fonts.captionFont, { color: colors.textMuted }]}>
          ${pricePerBoost.toFixed(2)} each
        </Text>
      </View>

      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: '#B8860B' }]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}
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
  
  const [selectedOption, setSelectedOption] = useState<number>(1); // Default to middle option
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [isProcessingActivation, setIsProcessingActivation] = useState(false);
  const [radianceStatus, setRadianceStatus] = useState({ 
    isActive: false, 
    timeRemaining: 0, 
    formattedTime: '00:00' 
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const boostOptions = [
    {
      boostCount: 1,
      pricePerBoost: 9.99,
      totalPrice: 9.99,
    },
    {
      boostCount: 3,
      pricePerBoost: 8.99,
      totalPrice: 26.97,
      tag: "Save 10%",
      popular: true,
    },
    {
      boostCount: 5,
      pricePerBoost: 7.99,
      totalPrice: 39.95,
      tag: "Save 20%",
    },
    {
      boostCount: 10,
      pricePerBoost: 6.99,
      totalPrice: 69.90,
      tag: "Save 30%",
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
      
      // Auto-scroll to popular option
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: 160, // Adjusted for wider cards
          animated: true,
        });
      }, 300);
    }
  }, [visible]);

  const handleActivateExistingBoost = async () => {
    if (!userData.activeBoosts || userData.activeBoosts < 1) {
      return;
    }

    setIsProcessingActivation(true);
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
      setIsProcessingActivation(false);
    }
  };

  // Handle Stripe Purchase
  const handlePurchase = async () => {
    setIsProcessingPurchase(true);
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
        "Success! 🎉",
        `You got ${option.boostCount} Radiance${option.boostCount !== 1 ? 's' : ''}!`,
        [{ text: "Nice!", style: "default" }]
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
      setIsProcessingPurchase(false);
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
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Active Radiance Status */}
            {hasActiveRadiance && (
              <View style={styles.activeRadianceSection}>
                <View style={[styles.activeRadianceCard, { backgroundColor: '#B8860B' + '08', borderColor: '#B8860B' }]}>
                  <View style={styles.activeRadianceHeader}>
                    <Ionicons name="radio" size={24} color="#B8860B" />
                    <Text style={[styles.activeRadianceTitle, fonts.spiritualLargeTitleFont, { color: '#B8860B' }]}>
                      Radiance Active
                    </Text>
                  </View>
                  <Text style={[styles.activeRadianceTime, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
                    {radianceStatus.formattedTime}
                  </Text>
                  <Text style={[styles.activeRadianceSubtext, fonts.bodyFont, { color: colors.textMuted }]}>
                    11x more visibility active!
                  </Text>
                </View>
              </View>
            )}

            {/* Available Boosts to Activate */}
            {!hasActiveRadiance && hasAvailableBoosts && (
              <View style={styles.availableBoostsSection}>
                <View style={[styles.currentBoostsDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <CustomIcon name="halo" size={28} color="#B8860B" />
                  <Text style={[styles.currentBoostsText, fonts.bodyFont, { color: colors.textDark }]}>
                    {userData.activeBoosts} radiance ready
                  </Text>
                </View>
                
                <Text style={[styles.heroTitle, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
                  Activate Your Radiance
                </Text>
                
                <Text style={[styles.heroSubtitle, fonts.bodyFont, { color: colors.textMuted }]}>
                  Get 11x more visibility for 1 hour
                </Text>
                
                <TouchableOpacity
                  style={[styles.activateButton, { backgroundColor: '#B8860B' }]}
                  onPress={handleActivateExistingBoost}
                  disabled={isProcessingActivation}
                  activeOpacity={0.8}
                >
                  {isProcessingActivation ? (
                    <>
                      <CustomIcon name="halo" size={28} color="#FFFFFF" />
                      <Text style={[styles.activateButtonText, fonts.buttonFont]}>
                        Activating...
                      </Text>
                    </>
                  ) : (
                    <>
                      <CustomIcon name="halo" size={28} color="#FFFFFF" />
                      <Text style={[styles.activateButtonText, fonts.buttonFont]}>
                        Activate for 1 Hour
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <Text style={[styles.orText, fonts.captionFont, { color: colors.textMuted }]}>
                  Or get more below
                </Text>
              </View>
            )}

            {/* Simple Hero for Purchase */}
            {(!hasAvailableBoosts || hasActiveRadiance) && (
              <View style={styles.heroSection}>
                <Text style={[styles.heroTitle, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
                  {hasActiveRadiance ? "Get More Radiance" : "Radiance Boosts"}
                </Text>
                <Text style={[styles.heroSubtitle, fonts.bodyFont, { color: colors.textMuted }]}>
                  Appear first in discovery and get 11x more connections
                </Text>
              </View>
            )}

            {/* Horizontal Boost Options */}
            <View style={styles.optionsSection}>
              <ScrollView 
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsContainer}
                decelerationRate="fast"
                snapToInterval={156}
                snapToAlignment="start"
              >
                {boostOptions.map((option, index) => (
                  <BoostOption
                    key={index}
                    boostCount={option.boostCount}
                    pricePerBoost={option.pricePerBoost}
                    totalPrice={option.totalPrice}
                    tag={option.tag}
                    popular={option.popular}
                    isSelected={selectedOption === index}
                    onSelect={() => setSelectedOption(index)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Simple Benefits */}
            <View style={styles.benefitsSection}>
              <View style={styles.benefitRow}>
                <Ionicons name="trending-up" size={16} color="#B8860B" />
                <Text style={[styles.benefitText, fonts.captionFont, { color: colors.textMuted }]}>
                  Appear first for 60 minutes
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <Ionicons name="people" size={16} color="#B8860B" />
                <Text style={[styles.benefitText, fonts.captionFont, { color: colors.textMuted }]}>
                  11x more profile views
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <Ionicons name="heart" size={16} color="#B8860B" />
                <Text style={[styles.benefitText, fonts.captionFont, { color: colors.textMuted }]}>
                  Higher match rate
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
                  backgroundColor: isProcessingPurchase ? colors.textMuted : '#B8860B',
                  opacity: isProcessingPurchase ? 0.7 : 1
                }
              ]}
              onPress={handlePurchase}
              disabled={isProcessingPurchase}
              activeOpacity={0.8}
            >
              {isProcessingPurchase ? (
                <>
                  <OuroborosLoader 
                    size={50}
                    duration={3000}
                    fillColor="#F5E6D3"
                    strokeColor="#7B6B5C"
                    strokeWidth={1.5}
                    loop={true}
                  />
                  <Text style={[styles.purchaseButtonText, fonts.buttonFont]}>
                    Processing Payment...
                  </Text>
                </>
              ) : (
                <>
                  <CustomIcon name="halo" size={38} color="#FFFFFF" />
                  <Text style={[styles.purchaseButtonText, fonts.buttonFont]}>
                    Get {boostOptions[selectedOption].boostCount} Radiance • ${boostOptions[selectedOption].totalPrice.toFixed(2)}
                  </Text>
                </>
              )}
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
  scrollView: {
    paddingTop: Platform.select({ ios: 80, android: 60 }),
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Active Radiance Section
  activeRadianceSection: {
    marginBottom: Spacing.xl,
  },
  activeRadianceCard: {
    borderRadius: 16,
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
    marginLeft: Spacing.sm,
  },
  activeRadianceTime: {
    fontSize: Typography.sizes['2xl'],
    marginBottom: Spacing.sm,
  },
  activeRadianceSubtext: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },

  // Available Boosts Section
  availableBoostsSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  currentBoostsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  currentBoostsText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  activateButtonText: {
    color: '#FFFFFF',
  },
  orText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Options Section
  optionsSection: {
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  boostOption: {
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: Spacing.md,
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
  boostDisplay: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  boostIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  boostCountText: {
    fontSize: Typography.sizes.lg,
  },
  boostLabel: {
    fontSize: Typography.sizes.xs,
  },
  pricingContainer: {
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: Typography.sizes.sm,
    marginBottom: 2,
  },
  pricePerBoost: {
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

  // Benefits Section
  benefitsSection: {
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

  // Purchase Section
  purchaseSection: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
  },
  disclaimerText: {
    textAlign: 'center',
  },
});

export default RadianceScreen;