import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  Animated,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";
import { useStripe } from "@stripe/stripe-react-native";
import { FUNCTIONS, FIRESTORE } from "@/services/FirebaseConfig"
import OuroborosSVG from "@/components/ouroboros/OuroborosSVG";
import { CustomIcon } from "@/components/CustomIcon";

interface PricingPlan {
  title: string;
  price: number;
  weeklyPrice: number;
  totalPrice: number;
  originalTotal?: number; // Made optional since not all plans have it
  savings: string | null;
  popular: boolean;
}

export default function FullCircleSubscription() {
  const router = useRouter();
  const { userData, setUserData, currentUser } = useUserContext();
  
  const { presentPaymentSheet, initPaymentSheet } = useStripe();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '3months' | '6months'>('3months');
  const [isProcessing, setIsProcessing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const subscription = userData.subscription;
  const hasSubscription = !!subscription?.subscriptionId;
  
  const isIncompleteAndCanceled = subscription?.status === 'incomplete' && subscription?.cancelAtPeriodEnd;
  const isIncompleteAndPending = subscription?.status === 'incomplete' && !subscription?.cancelAtPeriodEnd;
  
  const isActiveAndContinuing = subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd;
  const isActiveButCanceling = subscription?.status === 'active' && subscription?.cancelAtPeriodEnd;
  
  const showAsActive = isActiveAndContinuing || isIncompleteAndPending;
  const canCancel = isActiveAndContinuing || isIncompleteAndPending;
  const canReactivate = isIncompleteAndCanceled || isActiveButCanceling;
  const showUpgradeOptions = !hasSubscription || subscription?.status === 'canceled';

  const pricingPlans: Record<'1month' | '3months' | '6months', PricingPlan> = {
    '1month': {
      title: '1 Month',
      price: 29.99,
      weeklyPrice: 7.50,
      totalPrice: 29.99,
      savings: null,
      popular: false
    },
    '3months': {
      title: '3 Months',
      price: 24.99,
      weeklyPrice: 6.25,
      totalPrice: 74.97,
      originalTotal: 89.97,
      savings: '17%',
      popular: true
    },
    '6months': {
      title: '6 Months',
      price: 19.99,
      weeklyPrice: 5.00,
      totalPrice: 119.94,
      originalTotal: 179.94,
      savings: '33%',
      popular: false
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const refreshUserData = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const docSnap: any = await FIRESTORE.collection('users').doc(currentUser.uid).get();
      
      if (docSnap.exists) {
        const freshData = docSnap.data();
        
        setUserData(prevData => ({
          ...prevData,
          ...freshData
        }));
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };

  const getRemainingDays = () => {
    if (!subscription?.currentPeriodEnd) return 0;
    const now = Math.floor(Date.now() / 1000);
    const remaining = Math.max(0, Math.ceil((subscription.currentPeriodEnd - now) / (60 * 60 * 24)));
    return remaining;
  };

  const remainingDays = getRemainingDays();

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      console.log(`🚀 Creating ${selectedPlan} subscription...`);
      
      const createSubscriptionFunction = FUNCTIONS.httpsCallable('createSubscription');
      const result = await createSubscriptionFunction({ planType: selectedPlan });
      
      if (!result.data) {
        throw new Error('No data returned from Cloud Function');
      }
      
      const { clientSecret, subscriptionId, status } = result.data as any;
      
      if (!clientSecret || !subscriptionId) {
        throw new Error('Invalid response from subscription creation');
      }
      
      console.log(`✅ Subscription created: ${subscriptionId}`);
      
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FullCircle',
        returnURL: 'fullcircle://payment-return',
        defaultBillingDetails: {
          name: userData.fullName || userData.firstName || 'Seeker',
        },
        appearance: {
          colors: {
            primary: '#B8860B',
          },
        },
      });

      if (initError) {
        console.error('❌ Payment sheet init failed:', initError);
        Alert.alert('Energy Blockage', 'Unable to process payment. Please try again.');
        return;
      }

      console.log('✅ Payment sheet initialized');
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('📱 Presenting payment sheet...');
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error('❌ Payment failed:', paymentError);
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Incomplete', paymentError.message || 'Your payment journey was interrupted.');
        }
        return;
      }

      console.log('✅ Payment completed successfully!');

      Alert.alert(
        "🌟 Welcome to FullCircle!",
        "Your spiritual journey expands now. FullCircle Features are activating...",
        [
          { 
            text: "Continue Journey", 
            style: "default",
            onPress: async () => {
              console.log('🔄 Refreshing subscription data before going back...');
              await refreshUserData();
              router.back();
            }
          }
        ]
      );

      setTimeout(async () => {
        console.log('🔄 Background refresh after webhook processing...');
        await refreshUserData();
      }, 3000);
      
    } catch (error: any) {
      console.error('💥 Subscription creation failed:', error);
      Alert.alert(
        "Journey Interrupted",
        error.message || "We couldn't begin your FullCircle journey. Please try again.",
        [{ text: "Try Again", style: "default" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    const daysLeft = getRemainingDays();
    const hasValidPeriodEnd = subscription?.currentPeriodEnd;
    
    Alert.alert(
      "Release Your Membership?",
      hasValidPeriodEnd 
        ? `Your FullCircle journey will continue for ${daysLeft} more days until ${formatCancelDate()}. Are you certain?`
        : `Your FullCircle journey will continue until ${formatCancelDate()}. Are you certain?`,
      [
        { text: "Continue Journey", style: "cancel" },
        { 
          text: "Release", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              
              const cancelSubscriptionFunction = FUNCTIONS.httpsCallable('cancelSubscription');
              const result = await cancelSubscriptionFunction();
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              await refreshUserData();
              
              const message = hasValidPeriodEnd 
                ? `You'll keep FullCircle access for ${daysLeft} more days until ${formatCancelDate()}`
                : `You'll keep FullCircle access until ${formatCancelDate()}`;
              Alert.alert("Journey Continues", message);
            } catch (error) {
              Alert.alert("Unable to Process", "Your cancellation request couldn't be completed. Please try again.");
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleReactivate = async () => {
    try {
      setIsProcessing(true);
      
      const reactivateFunction = FUNCTIONS.httpsCallable('reactivateSubscription');
      const result: any = await reactivateFunction();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserData();
      
      if (result.data?.success) {
        Alert.alert("🌟 Journey Renewed!", "Your spiritual path continues uninterrupted.");
      } else {
        Alert.alert("Unable to Renew", "We couldn't reactivate your journey. Please try again.");
      }
    } catch (error) {
      Alert.alert("Energy Blockage", "Unable to renew your journey. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCancelDate = () => {
    if (!subscription?.currentPeriodEnd) return "soon";
    const date = new Date(subscription.currentPeriodEnd * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusDisplay = () => {
    if (!hasSubscription) {
      return {
        title: "Unlock Your Infinite Potential",
        subtitle: "Transform your connections with FullCircle spiritual features",
        icon: "sparkles",
        color: colors.primary,
        timeText: null
      };
    }
    
    if (subscription?.status === 'incomplete') {
      if (subscription?.cancelAtPeriodEnd) {
        return {
          title: "Subscription Canceled",
          subtitle: "Your journey was paused before activation. Renew to continue your spiritual path.",
          icon: "pause-circle",
          color: "#FF9500",
          timeText: `Would activate until ${formatCancelDate()}`
        };
      } else {
        return {
          title: "Payment Pending",
          subtitle: "Complete your payment to activate FullCircle features.",
          icon: "time",
          color: "#FF9500",
          timeText: "Payment required"
        };
      }
    }
    
    if (subscription?.status === 'active') {
      if (subscription?.cancelAtPeriodEnd) {
        return {
          title: "Journey Ending",
          subtitle: "Your FullCircle path concludes soon. Renew to continue growing.",
          icon: "time",
          color: "#FF9500",
          timeText: remainingDays > 0 ? `${remainingDays} days left` : "Ends today"
        };
      } else {
        return {
          title: "FullCircle Member",
          subtitle: `Premium spiritual journey in progress`,
          icon: "checkmark-circle",
          color: "#B8860B",
          timeText: remainingDays > 0 ? `${remainingDays} days remaining` : "Renews today"
        };
      }
    }
    
    if (subscription?.status === 'canceled') {
      return {
        title: "Journey Paused",
        subtitle: "Your subscription has ended. Restart your FullCircle spiritual exploration.",
        icon: "pause-circle",
        color: "#6B7280",
        timeText: null
      };
    }
    
    return {
      title: `Subscription ${subscription?.status || 'Unknown'}`,
      subtitle: "Contact support if you need assistance with your subscription.",
      icon: "help-circle",
      color: "#6B7280",
      timeText: null
    };
  };

  const status = getStatusDisplay();
  const selectedPlanData = pricingPlans[selectedPlan];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.glowContainer,
                {
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                }
              ]}
            >
              <OuroborosSVG
                size={120}
                fillColor='#F5E6D3'
                strokeColor='#B8860B'
                strokeWidth={2}
              />
              
              <View style={styles.sparklesOverlay}>
                <CustomIcon name="infinite" size={20} color="#B8860B" />
              </View>
            </Animated.View>
          </Animated.View>
          
          <Text style={styles.spiritualTitle}>FullCircle</Text>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusCard, { borderColor: status.color }]}>
            <Text style={styles.statusTitle}>{status.title}</Text>
            <Text style={styles.statusSubtitle}>{status.subtitle}</Text>
            
            {status.timeText && (
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{status.timeText}</Text>
              </View>
            )}
            
            {/* Action Buttons */}
            {(canCancel || canReactivate) && (
              <View style={styles.actionButtons}>
                {canCancel && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={isProcessing}
                  >
                    <Text style={styles.cancelButtonText}>Release Membership</Text>
                  </TouchableOpacity>
                )}
                
                {canReactivate && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={handleReactivate}
                    disabled={isProcessing}
                  >
                    <Text style={styles.actionButtonText}>Renew Journey</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Upgrade Options */}
        {showUpgradeOptions && (
          <View style={styles.upgradeSection}>
            <Text style={styles.sectionTitle}>Choose Your Sacred Path</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.plansScrollContainer}
              decelerationRate="fast"
              snapToInterval={180}
              snapToAlignment="center"
            >
              {Object.entries(pricingPlans).map(([planKey, plan]) => (
                <>
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    key={planKey}
                    style={[
                      styles.planCard,
                      styles.planCardColumn,
                      selectedPlan === planKey && styles.planCardSelected,
                      plan.popular && styles.popularPlan
                    ]}
                    onPress={() => setSelectedPlan(planKey as any)}
                  > 
                    <View style={styles.planContent}>
                      {plan.savings && (
                        <Text style={styles.savingsText}>Save {plan.savings}</Text>
                      )}
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.weeklyPrice}>${plan.weeklyPrice.toFixed(2)}/wk</Text>
                    </View>
                    
                    {selectedPlan === planKey && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={20} color="#B8860B" />
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Enhanced Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Sacred Features Unlocked</Text>
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <CustomIcon name="infinite" size={24} color="#B8860B" />
              </View>
              <Text style={styles.featureText}>Unlimited Soul Connections</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <CustomIcon name="heart" size={24} color="#B8860B" />
              </View>
              <Text style={styles.featureText}>See Who Resonates With You</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="options" size={24} color="#B8860B" />
              </View>
              <Text style={styles.featureText}>Advanced Spiritual Filters</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <CustomIcon name="lotus" size={24} />
              </View>
              <Text style={styles.featureText}>Priority Spiritual Visibility</Text>
            </View>
          </View>
          <Text style={styles.cancelAnytimeText}>
            Cancel anytime and keep all premium features until your cycle ends
          </Text>
        </View>

        {/* Bottom Spacer for Floating Button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Purchase Button - Pure Floating */}
      {showUpgradeOptions && (
        <TouchableOpacity
          style={[
            styles.floatingSubscribeButton,
            { 
              backgroundColor: isProcessing ? colors.textMuted : '#B8860B',
              shadowColor: '#B8860B',
            }
          ]}
          onPress={handleUpgrade}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Animated.View 
                style={{
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }}
              >
                <CustomIcon name="infinite" size={18} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.subscribeButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <CustomIcon name="infinite" size={20} color="#FFFFFF" />
              <Text style={styles.subscribeButtonText}>
                Start {selectedPlanData.title} Journey • ${selectedPlanData.totalPrice.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: any) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.select({ ios: 50, android: 30 }),
      paddingBottom: Spacing.md,
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
    // Scroll Container
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: 100,
    },
    
    bottomSpacer: {
      height: 20,
    },
    
    heroSection: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    iconContainer: {
      marginTop: -20,
    },
    glowContainer: {
      position: 'relative',
      shadowColor: '#B8860B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
      elevation: 10,
    },
    sparklesOverlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 32,
      height: 32,
      marginTop: -16,
      marginLeft: -16,
      backgroundColor: '#B8860B' + '20',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spiritualTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes['3xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: 'center',
      marginTop: Spacing.md,
      letterSpacing: 1,
    },    
    statusSection: {
      marginBottom: Spacing.lg,
    },
    statusCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 2,
      alignItems: 'center',
    },
    statusTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    statusSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: Spacing.md,
      lineHeight: 20,
    },
    timeContainer: {
      backgroundColor: '#B8860B' + '20',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.md,
    },
    timeText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: '#B8860B',
      fontWeight: Typography.weights.semibold,
      textAlign: 'center',
    },
    
    // Action Buttons
    actionButtons: {
      width: '100%',
      gap: Spacing.sm,
    },
    actionButton: {
      borderRadius: BorderRadius.sm,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.sm,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    cancelButtonText: {
      color: colors.textMuted,
      fontWeight: Typography.weights.medium,
      fontSize: Typography.sizes.sm,
    },
    
    // Enhanced Upgrade Section
    upgradeSection: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.lg,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    
    // Horizontal Scrollable Plans
    plansScrollContainer: {
      paddingHorizontal: Spacing.sm,
    },
    planCardColumn: {
      width: 160, // Fixed width for each column
      minHeight: 150, // Minimum height for content
      marginRight: Spacing.md, // Space between cards
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
      position: 'relative',
    },
    planCardSelected: {
      borderColor: '#B8860B',
      backgroundColor: '#B8860B' + '10',
      transform: [{ scale: 1.01 }],
    },
    popularPlan: {
      borderColor: '#B8860B',
      shadowColor: '#B8860B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    // Smaller Popular Badge at Top Border
    popularBadge: {
      position: 'absolute',
      left: '50%',
      marginLeft: -75, // Smaller width (80px total)
      backgroundColor: '#B8860B',
      paddingHorizontal: Spacing.sm, // Reduced padding
      paddingVertical: 2, // Reduced padding
      borderRadius: BorderRadius.sm, // Smaller radius
      zIndex: 1,
    },
    popularText: {
      color: '#FFFFFF',
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      letterSpacing: 0.8, // Reduced letter spacing
    },
    
    // Centered Plan Content
    planContent: {
      justifyContent: 'center',
      alignItems: 'center', // Center everything
      width: '100%',
      marginTop: Spacing.md,
    },
    planHeader: {
      alignItems: 'center', // Center the header content
      width: '100%',
    },
    planLeft: {
      alignItems: 'center', // Center title and weekly price
      marginBottom: Spacing.sm,
    },
    planRight: {
      alignItems: 'center', // Center price info
    },
    planTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    weeklyPrice: {
      fontSize: Typography.sizes.sm,
      color: '#B8860B',
      fontWeight: Typography.weights.medium,
      textAlign: 'center',
    },
    originalPrice: {
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
      marginBottom: 2,
      textAlign: 'center',
    },
    planPrice: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: 'center',
    },
    planPeriod: {
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    savingsContainer: {
      backgroundColor: '#B8860B' + '15',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    savings: {
      fontSize: Typography.sizes.xs,
      color: '#B8860B',
      fontWeight: Typography.weights.bold,
      textAlign: 'center',
    },
    selectedIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
    
    // Pure Floating Purchase Button (No Container)
    floatingSubscribeButton: {
      position: 'absolute',
      bottom: 30,
      left: Spacing.lg,
      right: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.lg,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    subscribeButtonText: {
      color: '#FFFFFF',
      fontWeight: Typography.weights.bold,
      fontSize: Typography.sizes.base,
      letterSpacing: 0.5,
    },
    
    // Enhanced Features Section
    featuresSection: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featuresTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    featuresList: {
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#B8860B' + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      flex: 1,
      lineHeight: 22,
    },
    cancelAnytimeText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 18,
    },
    savingsText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      marginBottom: Spacing.sm
      // lineHeight: 22,
    },
  });
};