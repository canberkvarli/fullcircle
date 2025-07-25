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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";
import { useStripe } from "@stripe/stripe-react-native";
import { FUNCTIONS, FIRESTORE } from "@/services/FirebaseConfig"

export default function FullCircleSubscription() {
  const router = useRouter();
  const { userData, setUserData, currentUser } = useUserContext();
  
  const { presentPaymentSheet, initPaymentSheet } = useStripe();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ✅ SIMPLE: Just trust userData.subscription directly
  const subscription = userData.subscription;
  const hasSubscription = !!subscription?.subscriptionId;
  
  const showAsActive = subscription?.isActive === true || 
                      subscription?.status === 'incomplete';
  const canCancel = (subscription?.status === 'active' || subscription?.status === 'incomplete') && 
                  !subscription?.cancelAtPeriodEnd;  
  const canReactivate = (subscription?.status === 'active' || subscription?.status === 'incomplete') && 
                     subscription?.cancelAtPeriodEnd;
  const showUpgradeOptions = !hasSubscription || (!showAsActive && !canReactivate);

  // ✅ Manual refresh function
  const refreshUserData = async () => {
    if (!currentUser?.uid) return;
    
    try {
      console.log('🔄 Refreshing user data from Firestore...');
      const docSnap = await FIRESTORE.collection('users').doc(currentUser.uid).get();
      
      if (docSnap.exists) {
        const freshData: any = docSnap.data();
        console.log('✅ Fresh subscription data:', JSON.stringify(freshData.subscription, null, 2));
        
        setUserData(prevData => ({
          ...prevData,
          ...freshData
        }));
        
        console.log('✅ User data refreshed successfully');
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      console.log(`🚀 Creating ${selectedPlan} subscription...`);
      
      // ✅ Call Cloud Function directly
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
            primary: '#8B4513',
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
        "Your spiritual journey expands now. Premium features are activating...",
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
        error.message || "We couldn't begin your premium journey. Please try again.",
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
        title: "Begin Your FullCircle Journey",
        subtitle: "Unlock deeper connections and spiritual growth",
        icon: "sparkles",
        color: colors.primary,
        timeText: null
      };
    }
    
    if (subscription?.status === 'incomplete') {
      return {
        title: "FullCircle Active",
        subtitle: "Your energy is flowing. Enhanced features are yours to explore.",
        icon: "checkmark-circle",
        color: "#FFD700",
        timeText: null
      };
    }
    
    if (subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd) {
      return {
        title: "FullCircle Member",
        subtitle: `${subscription.planType === 'yearly' ? 'Annual' : 'Monthly'} journey in progress`,
        icon: "checkmark-circle",
        color: "#FFD700",
        timeText: remainingDays > 0 ? `${remainingDays} days remaining` : "Renews today"
      };
    }
    
    if (subscription?.status === 'active' && subscription?.cancelAtPeriodEnd) {
      return {
        title: "Journey Ending",
        subtitle: "Your FullCircle path concludes soon. Renew to continue growing.",
        icon: "time",
        color: "#FF9500",
        timeText: remainingDays > 0 ? `${remainingDays} days left` : "Ends today"
      };
    }
    
    return {
      title: "Journey Paused",
      subtitle: "Restart your FullCircle spiritual exploration",
      icon: "pause-circle",
      color: "#6B7280",
      timeText: null
    };
  };

  const status = getStatusDisplay();

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

      {/* Content */}
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="radio-button-on" size={60} color="#8B4513" />
          </View>
          <Text style={styles.spiritualTitle}>FullCircle</Text>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusCard, { borderColor: status.color }]}>
            <Ionicons name={status.icon as any} size={28} color={status.color} />
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
            <Text style={styles.sectionTitle}>Choose Your Path</Text>
            
            {/* Side by Side Plans */}
            <View style={styles.plansRow}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  styles.planCardHalf,
                  selectedPlan === 'monthly' && styles.planCardSelected
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.planPrice}>$29.99</Text>
                <Text style={styles.planPeriod}>per month</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.planCard,
                  styles.planCardHalf,
                  styles.yearlyPlan,
                  selectedPlan === 'yearly' && styles.planCardSelected
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
                <Text style={styles.planTitle}>Yearly</Text>
                <View style={styles.priceColumn}>
                  <Text style={styles.originalPrice}>$359.88</Text>
                  <Text style={styles.planPrice}>$199.99</Text>
                </View>
                <Text style={styles.planPeriod}>per year</Text>
                <Text style={styles.savings}>Save 44%</Text>
              </TouchableOpacity>
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                { backgroundColor: isProcessing ? colors.textMuted : colors.primary }
              ]}
              onPress={handleUpgrade}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.subscribeButtonText}>Manifesting...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.subscribeButtonText}>
                    Begin FullCircle Journey
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Enhanced Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Ionicons name="infinite" size={18} color="#FFD700" />
              <Text style={styles.featureText}>Unlimited Soul Connections</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="eye" size={18} color="#FFD700" />
              <Text style={styles.featureText}>See Who Resonates With You</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="filter" size={18} color="#FFD700" />
              <Text style={styles.featureText}>Spiritual Compatibility Filters</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="flash" size={18} color="#FFD700" />
              <Text style={styles.featureText}>Radiance Boosts</Text>
            </View>
          </View>
          <Text style={styles.cancelAnytimeText}>
            Cancel anytime and keep using enhanced features until your period ends
          </Text>
        </View>
      </View>
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
    content: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
    },
    
    // Hero Section
    heroSection: {
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    iconContainer: {
      marginBottom: Spacing.sm,
      opacity: 0.9,
    },
    spiritualTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    
    // Status Section
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
    },
    timeContainer: {
      backgroundColor: '#FFD700' + '20',
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
    
    // Upgrade Section
    upgradeSection: {
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    plansRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
    },
    planCardHalf: {
      flex: 1,
    },
    planCardSelected: {
      borderColor: '#FFD700',
      backgroundColor: '#FFD700' + '15',
    },
    yearlyPlan: {
      position: 'relative',
    },
    bestValueBadge: {
      position: 'absolute',
      top: -8,
      backgroundColor: '#FFD700',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    bestValueText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: Typography.weights.bold,
    },
    planTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.xs,
    },
    priceColumn: {
      alignItems: 'center',
    },
    originalPrice: {
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
      marginBottom: 2,
    },
    planPrice: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
    },
    planPeriod: {
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
      fontStyle: 'italic',
    },
    savings: {
      fontSize: Typography.sizes.xs,
      color: '#FFD700',
      fontWeight: Typography.weights.semibold,
    },
    
    // Subscribe Button
    subscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
    },
    subscribeButtonText: {
      color: '#FFFFFF',
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.base,
    },
    
    // Features Section
    featuresSection: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    featuresTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    featuresList: {
      gap: Spacing.sm,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    featureText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      flex: 1,
    },
    cancelAnytimeText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: Spacing.sm,
    },
  });
};