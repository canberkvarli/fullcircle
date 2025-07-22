import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";
import { useStripe } from "@stripe/stripe-react-native";
import { useFocusEffect } from '@react-navigation/native';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  isHighlighted?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  isHighlighted = false 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const styles = createFeatureCardStyles(colorScheme, isHighlighted, fonts);
  return (
    <View style={styles.featureCard}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      {isHighlighted && (
        <View style={styles.highlightBadge}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

export default function FullCircleSubscription() {
  const router = useRouter();
  const { 
    userData, 
    createSubscription, 
    cancelSubscription, 
    getSubscriptionStatus,
    getSubscriptionDisplayInfo, // 🆕 NEW: Use the new helper function
    updateUserData,
    reactivateSubscription,
  } = useUserContext();
  
  const { presentPaymentSheet, initPaymentSheet } = useStripe();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔄 UPDATED: Use new helper function for display status
  const getDisplayStatus = () => {
    return getSubscriptionDisplayInfo();
  };

  const displayStatus = getDisplayStatus();

  useFocusEffect(
    useCallback(() => {
      loadSubscriptionStatus();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoadingStatus(true);
      const status = await getSubscriptionStatus();
      setSubscriptionData(status);
      console.log('📊 Loaded subscription status:', status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleReactivate = async () => {
    Alert.alert(
      "Reactivate Subscription",
      "Would you like to reactivate your FullCircle subscription? Your current benefits will continue and auto-renewal will resume.",
      [
        { text: "Not Now", style: "cancel" },
        { 
          text: "Reactivate", 
          style: "default",
          onPress: async () => {
            try {
              setIsProcessing(true);
              const result = await reactivateSubscription();
              
              if (result.success) {
                Alert.alert(
                  "🎉 Subscription Reactivated!",
                  "Your FullCircle subscription is now active again and will auto-renew at the end of your current period.",
                  [{ text: "Great!", style: "default" }]
                );
                await loadSubscriptionStatus();
              } else {
                Alert.alert(
                  "Reactivation Failed",
                  result.message || "We couldn't reactivate your subscription right now. Please try again.",
                  [{ text: "OK", style: "default" }]
                );
              }
            } catch (error) {
              console.error('Reactivation failed:', error);
              Alert.alert(
                "Reactivation Failed",
                "We couldn't reactivate your subscription right now. Please try again.",
                [{ text: "OK", style: "default" }]
              );
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  // 🔄 UPDATED: Better handleUpgrade function with proper state updates
  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      console.log(`🚀 Creating ${selectedPlan} subscription...`);
      
      // 1. Create subscription
      const { clientSecret, subscriptionId } = await createSubscription(selectedPlan);
      console.log(`✅ Subscription created: ${subscriptionId}`);
      
      // 2. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FullCircle',
        returnURL: 'fullcircle://payment-return',
        defaultBillingDetails: {
          name: userData.fullName || userData.firstName || 'Customer',
        },
        appearance: {
          colors: {
            primary: '#007AFF',
          },
        },
      });

      if (initError) {
        console.error('❌ Payment sheet init failed:', initError);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }

      console.log('✅ Payment sheet initialized');

      // 3. Add delay before presenting (fix for infinite loading)
      console.log('⏳ Waiting 1 second before presenting payment sheet...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Present payment sheet
      console.log('📱 Presenting payment sheet...');
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error('❌ Payment failed:', paymentError);
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message || 'Payment was not completed.');
        }
        return;
      }

      console.log('✅ Payment completed successfully!');

      // 5. Wait for Stripe to process the payment
      console.log('⏳ Waiting for payment processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 6. Refresh subscription status multiple times to ensure we get the updated status
      console.log('🔄 Refreshing subscription status...');
      let attempts = 0;
      let subscriptionActive = false;

      while (attempts < 5 && !subscriptionActive) {
        try {
          const statusData = await getSubscriptionStatus();
          console.log(`📊 Status check ${attempts + 1}:`, statusData);
          
          if (statusData.hasSubscription && statusData.isActive) {
            subscriptionActive = true;
            console.log('🎉 Subscription is now active!');
            break;
          }
          
          attempts++;
          if (attempts < 5) {
            console.log(`⏳ Waiting 2 seconds before next check...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`❌ Status check ${attempts + 1} failed:`, error);
          attempts++;
        }
      }

      // 7. Update local state immediately with successful subscription
      await updateUserData({
        subscription: {
          isActive: true,
          subscriptionId: subscriptionId,
          status: 'active' as const,
          planType: selectedPlan,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // 8. Show success message
      Alert.alert(
        "🎉 Welcome to FullCircle Premium!",
        "Your subscription is now active! Enjoy unlimited connections and premium features!",
        [
          { 
            text: "Start Exploring!", 
            style: "default",
            onPress: () => router.back()
          }
        ]
      );

      // 9. Final refresh of subscription status
      setTimeout(() => {
        loadSubscriptionStatus();
      }, 1000);
      
    } catch (error: any) {
      console.error('💥 Subscription creation failed:', error);
      Alert.alert(
        "Subscription Failed",
        error.message || "We couldn't create your subscription right now. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔄 UPDATED: Better cancel subscription with proper state updates
  const handleCancelSubscription = async () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your FullCircle subscription? You'll continue to have access to premium features until the end of your current billing period.",
      [
        { text: "Keep Subscription", style: "cancel" },
        { 
          text: "Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              await cancelSubscription();
              
              Alert.alert(
                "Subscription Canceled",
                "Your subscription has been canceled. You'll continue to have access to premium features until the end of your current billing period.",
                [{ text: "OK", style: "default" }]
              );
              
              await loadSubscriptionStatus();
            } catch (error) {
              console.error('Cancellation failed:', error);
              Alert.alert(
                "Cancellation Failed",
                "We couldn't cancel your subscription right now. Please try again.",
                [{ text: "OK", style: "default" }]
              );
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const premiumFeatures = [
    {
      icon: "infinite-outline",
      title: "Unlimited Connections",
      description: "Connect with as many souls as you wish without limits",
      isHighlighted: true
    },
    {
      icon: "eye-outline", 
      title: "See Who Likes You",
      description: "Discover your admirers and make meaningful connections"
    },
    {
      icon: "filter-outline",
      title: "Advanced Spiritual Filters",
      description: "Find perfect matches based on spiritual compatibility"
    },
    {
      icon: "rocket-outline",
      title: "Profile Boosts",
      description: "Get 5x more visibility with weekly profile boosts"
    },
    {
      icon: "sparkles-outline",
      title: "FullCircle Badge",
      description: "Stand out with an exclusive premium member badge"
    },
    {
      icon: "people-outline",
      title: "Priority Matching",
      description: "Get shown to the most compatible souls first"
    }
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Ionicons 
              name={
                displayStatus.isActive && !displayStatus.canReactivate
                  ? "checkmark-circle"
                  : displayStatus.isActive && displayStatus.canReactivate 
                    ? "warning"
                    : "sparkles"
              } 
              size={32} 
              color={
                displayStatus.isActive && !displayStatus.canReactivate
                  ? "#4CAF50"
                  : displayStatus.isActive && displayStatus.canReactivate 
                    ? "#FF9500"
                    : colors.primary
              } 
            />
          </View>
          {/* 🔄 UPDATED: Hero Section text based on new status */}
          <Text style={styles.mainTitle}>
            {displayStatus.isActive && !displayStatus.canReactivate
              ? "FullCircle Premium Active"
              : displayStatus.isActive && displayStatus.canReactivate 
                ? "Subscription Ending Soon"
                : displayStatus.hasSubscription
                  ? "Subscription Inactive"
                  : "Deepen Your Connections"
            }
          </Text>
          <Text style={styles.subtitle}>
            {displayStatus.isActive && !displayStatus.canReactivate
              ? `You're enjoying unlimited spiritual connections and premium features. ${displayStatus.timeRemaining ? `${displayStatus.timeRemaining}.` : ''} You can cancel anytime and continue using premium features until the end of your billing period.`
              : displayStatus.isActive && displayStatus.canReactivate 
                ? `Your premium access is ending soon (${displayStatus.timeRemaining}). Reactivate to continue enjoying unlimited connections.`
                : displayStatus.hasSubscription
                  ? "Your subscription has ended. You can start a new subscription below to regain access to premium features."
                  : "Unlock advanced features designed for meaningful spiritual connections"
            }
          </Text>

          {!displayStatus.isActive && !loadingStatus && (
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={loadSubscriptionStatus}
              disabled={loadingStatus}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={styles.restoreButtonText}>
                {loadingStatus ? 'Checking...' : 'Refresh Status'}
              </Text>
            </TouchableOpacity>
          )}
          
          {loadingStatus && (
            <View style={styles.loadingIndicator}>
              <Ionicons name="radio-outline" size={16} color={colors.primary} />
              <Text style={styles.loadingText}>Checking subscription status...</Text>
            </View>
          )}
        </View>

        {/* 🔄 UPDATED: Current Subscription Status - Enhanced */}
        {displayStatus.hasSubscription && displayStatus.isActive && (
          <View style={styles.currentSubscriptionSection}>
            <View style={[styles.subscriptionCard, { 
              backgroundColor: displayStatus.canReactivate ? '#FF9500' + '10' : colors.primary + '10', 
              borderColor: displayStatus.canReactivate ? '#FF9500' : colors.primary 
            }]}>
              <View style={styles.subscriptionHeader}>
                <Ionicons 
                  name={displayStatus.canReactivate ? "warning" : "checkmark-circle"} 
                  size={24} 
                  color={displayStatus.canReactivate ? '#FF9500' : colors.primary} 
                />
                <Text style={[styles.subscriptionTitle, { 
                  color: displayStatus.canReactivate ? '#FF9500' : colors.primary 
                }]}>
                  {displayStatus.displayText}
                </Text>
              </View>
              
              <Text style={[styles.subscriptionPlan, { color: colors.textDark }]}>
                {displayStatus.planType === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
              </Text>
              
              {/* 🆕 NEW: Time Remaining Display */}
              {displayStatus.timeRemaining && (
                <View style={styles.timeRemainingContainer}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.timeRemainingText, { color: colors.textMuted }]}>
                    {displayStatus.timeRemaining}
                  </Text>
                </View>
              )}
              
              <Text style={[styles.subscriptionDetails, { color: colors.textLight }]}>
                {displayStatus.canReactivate 
                  ? "Your subscription will end soon. You can reactivate to continue enjoying premium features, or let it expire and still use features until the end of your billing period."
                  : "Your premium subscription is active. You can cancel anytime and continue using premium features until the end of your billing period."
                }
              </Text>
              
              {displayStatus.canReactivate ? (
                <TouchableOpacity
                  style={[styles.reactivateButton, { backgroundColor: '#FF9500' }]}
                  onPress={handleReactivate}
                  disabled={isProcessing}
                >
                  <Text style={styles.reactivateButtonText}>
                    {isProcessing ? 'Reactivating...' : 'Reactivate Subscription'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.textMuted }]}
                  onPress={handleCancelSubscription}
                  disabled={isProcessing}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 🔄 UPDATED: Canceled Subscription Section */}
        {displayStatus.hasSubscription && !displayStatus.isActive && (
          <View style={styles.currentSubscriptionSection}>
            <View style={[styles.subscriptionCard, { 
              backgroundColor: '#6B7280' + '10', 
              borderColor: '#6B7280' 
            }]}>
              <View style={styles.subscriptionHeader}>
                <Ionicons name="information-circle" size={24} color="#6B7280" />
                <Text style={[styles.subscriptionTitle, { color: '#6B7280' }]}>
                  {displayStatus.displayText}
                </Text>
              </View>
              <Text style={[styles.subscriptionPlan, { color: colors.textDark }]}>
                Previous: {displayStatus.planType === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
              </Text>
              <Text style={[styles.subscriptionDetails, { color: colors.textLight }]}>
                You can start a new subscription below to regain access to premium features
              </Text>
            </View>
          </View>
        )}

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <View style={styles.featuresGrid}>
            {premiumFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isHighlighted={feature.isHighlighted}
              />
            ))}
          </View>
        </View>

        {/* Pricing Section - Show if needs new subscription */}
        {!displayStatus.isActive && (
          <>
            <View style={styles.pricingSection}>
              <Text style={styles.sectionTitle}>
                {displayStatus.hasSubscription ? 'Start New Subscription' : 'Choose Your Plan'}
              </Text>
              
              <View style={styles.planContainer}>
                {/* Monthly Plan */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'monthly' && styles.planCardSelected
                  ]}
                  onPress={() => setSelectedPlan('monthly')}
                >
                  <Text style={[
                    styles.planTitle,
                    selectedPlan === 'monthly' && styles.planTitleSelected
                  ]}>
                    Monthly
                  </Text>
                  <Text style={[
                    styles.planPrice,
                    selectedPlan === 'monthly' && styles.planPriceSelected
                  ]}>
                    $29.99
                  </Text>
                  <Text style={styles.planPeriod}>per month</Text>
                </TouchableOpacity>
                
                {/* Yearly Plan */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    styles.planCardRecommended,
                    selectedPlan === 'yearly' && styles.planCardSelected
                  ]}
                  onPress={() => setSelectedPlan('yearly')}
                >
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>BEST VALUE</Text>
                  </View>
                  <Text style={[
                    styles.planTitle,
                    selectedPlan === 'yearly' && styles.planTitleSelected
                  ]}>
                    Yearly
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>$359.88</Text>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === 'yearly' && styles.planPriceSelected
                    ]}>
                      $199.99
                    </Text>
                  </View>
                  <Text style={styles.planPeriod}>per year</Text>
                  <Text style={styles.savings}>Save 44%</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  { backgroundColor: isProcessing ? colors.textMuted : colors.primary }
                ]}
                onPress={handleUpgrade}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <View style={styles.processingContainer}>
                    <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.upgradeButtonText}>
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.upgradeContainer}>
                    <Text style={styles.upgradeButtonText}>
                      {displayStatus.hasSubscription ? 'Start New Subscription' : 'Start Your FullCircle Journey'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.guaranteeSection}>
                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                <Text style={styles.guaranteeText}>
                  7-day money-back guarantee • Cancel anytime
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Testimonial */}
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialText}>
            "FullCircle's advanced matching helped me find my spiritual soulmate. The connection was instant and deep."
          </Text>
          <Text style={styles.testimonialAuthor}>— Sarah M.</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const createFeatureCardStyles = (colorScheme: 'light' | 'dark', isHighlighted: boolean, fonts: any) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    featureCard: {
      backgroundColor: isHighlighted ? colors.primary + '10' : colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: isHighlighted ? colors.primary + '30' : colors.border,
      position: 'relative',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    featureTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.xs,
    },
    featureDescription: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      lineHeight: Typography.sizes.sm * 1.4,
    },
    highlightBadge: {
      position: 'absolute',
      top: Spacing.sm,
      right: Spacing.sm,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

const createStyles = (colorScheme: 'light' | 'dark', fonts: any) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.select({ ios: 50, android: 30 }),
      paddingBottom: Spacing.lg,
      backgroundColor: colors.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollView: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['2xl'],
    },
    
    // Hero Section
    heroSection: {
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    logoContainer: {
      width: 60,
      height: 60,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    mainTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textLight,
      textAlign: 'center',
      lineHeight: Typography.sizes.lg * 1.4,
      paddingHorizontal: Spacing.md,
    },

    // Current Subscription Section
    currentSubscriptionSection: {
      marginBottom: Spacing.xl,
    },
    subscriptionCard: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 2,
      alignItems: 'center',
    },
    subscriptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    subscriptionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      marginLeft: Spacing.sm,
    },
    subscriptionPlan: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      marginBottom: Spacing.sm,
    },
    subscriptionDetails: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    // 🆕 NEW: Time remaining display styles
    timeRemainingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    timeRemainingText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.medium,
    },
    cancelButton: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    cancelButtonText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.medium,
    },
    reactivateButton: {
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reactivateButtonText: {
      color: '#FFFFFF',
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.base,
    },
    
    // Features Section
    featuresSection: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: 'left',
      marginBottom: Spacing.lg,
    },
    featuresGrid: {
      // Grid container
    },
    
    // Pricing Section
    pricingSection: {
      marginBottom: Spacing.xl,
    },
    planContainer: {
      gap: Spacing.md,
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    planCardRecommended: {
      borderColor: colors.primary + '50',
      backgroundColor: colors.primary + '05',
    },
    planCardSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primary + '10',
    },
    recommendedBadge: {
      position: 'absolute',
      top: -12,
      left: Spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
    },
    recommendedText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    planTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
    },
    planTitleSelected: {
      color: colors.primary,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    originalPrice: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    planPrice: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
    },
    planPriceSelected: {
      color: colors.primary,
    },
    planPeriod: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
    },
    savings: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.primary,
      fontWeight: Typography.weights.semibold,
    },
    
    // CTA Section
    ctaSection: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    upgradeButton: {
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.lg,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    upgradeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    processingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    upgradeButtonText: {
      ...fonts.spiritualBodyFont,
      color: '#FFFFFF',
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.lg,
    },
    guaranteeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.card,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    guaranteeText: {
      ...fonts.spiritualBodyFont,
      color: colors.textMuted,
      fontSize: Typography.sizes.sm,
      textAlign: 'center',
    },
    
    // Testimonial
    testimonialSection: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    testimonialText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: Typography.sizes.base * 1.5,
      marginBottom: Spacing.md,
    },
    testimonialAuthor: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: Typography.weights.medium,
    },
    
    // Loading and Status
    loadingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.md,
      padding: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
    },
    loadingText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
    },
    restoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      borderWidth: 1,
      borderColor: colors.primary + '30',
      borderRadius: BorderRadius.md,
      backgroundColor: colors.primary + '10',
    },
    restoreButtonText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.primary,
      fontWeight: Typography.weights.medium,
    },
  });
};