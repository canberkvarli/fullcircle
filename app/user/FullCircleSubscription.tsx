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

export default function FullCircleSubscription() {
  const router = useRouter();
  const { 
    userData, 
    createSubscription, 
    cancelSubscription, 
    getSubscriptionStatus,
    reactivateSubscription,
  } = useUserContext();
  
  const { presentPaymentSheet, initPaymentSheet } = useStripe();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Simple subscription logic
  const subscription = userData.subscription;
  const hasSubscription = !!subscription?.subscriptionId;
  
  // 🔧 FIX: Use the isActive value from subscription data, plus handle incomplete status
  const showAsActive = subscription?.isActive === true || 
                      subscription?.status === 'incomplete';
  const canCancel = (subscription?.status === 'active' || subscription?.status === 'incomplete') && 
                  !subscription?.cancelAtPeriodEnd;  
  const canReactivate = (subscription?.status === 'active' || subscription?.status === 'incomplete') && 
                     subscription?.cancelAtPeriodEnd;
  const showUpgradeOptions = !hasSubscription || (!showAsActive && !canReactivate);

  console.log('🔍 Simple subscription debug:', {
    hasSubscription,
    status: subscription?.status,
    showAsActive,
    canCancel,
    canReactivate,
    showUpgradeOptions
  });

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
      await getSubscriptionStatus();
      console.log('📊 Subscription status refreshed');
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      console.log(`🚀 Creating ${selectedPlan} subscription...`);
      const { clientSecret, subscriptionId } = await createSubscription(selectedPlan);
      console.log(`✅ Subscription created: ${subscriptionId}`);
      
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
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      
      Alert.alert(
        "🎉 Welcome to FullCircle Premium!",
        "Your subscription is being processed! You'll have access to premium features shortly.",
        [
          { 
            text: "Great!", 
            style: "default",
            onPress: () => {
              loadSubscriptionStatus();
              router.back();
            }
          }
        ]
      );
      
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

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure? You'll keep premium features until your billing period ends.",
      [
        { text: "Keep Subscription", style: "cancel" },
        { 
          text: "Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              await cancelSubscription();
              Alert.alert("Subscription Canceled", "You'll keep premium features until your billing period ends.");
              await loadSubscriptionStatus();
            } catch (error) {
              Alert.alert("Error", "Couldn't cancel subscription. Please try again.");
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
      const result = await reactivateSubscription();
      
      if (result.success) {
        Alert.alert("🎉 Reactivated!", "Your subscription will continue automatically.");
        await loadSubscriptionStatus();
      } else {
        Alert.alert("Error", "Couldn't reactivate subscription. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Couldn't reactivate subscription. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusDisplay = () => {
    if (!hasSubscription) {
      return {
        title: "Get FullCircle Premium",
        subtitle: "Unlock unlimited connections and premium features",
        icon: "sparkles",
        color: colors.primary
      };
    }
    
    if (subscription?.status === 'incomplete') {
      return {
        title: "Premium Active",
        subtitle: "Your payment is being processed. Premium features are already available!",
        icon: "checkmark-circle",
        color: "#4CAF50"
      };
    }
    
    if (subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd) {
      return {
        title: "Premium Active",
        subtitle: `You have FullCircle ${subscription.planType === 'yearly' ? 'Yearly' : 'Monthly'} Premium`,
        icon: "checkmark-circle",
        color: "#4CAF50"
      };
    }
    
    if (subscription?.status === 'active' && subscription?.cancelAtPeriodEnd) {
      return {
        title: "Subscription Ending",
        subtitle: "Your subscription is set to cancel. Reactivate to continue premium features.",
        icon: "warning",
        color: "#FF9500"
      };
    }
    
    return {
      title: "Subscription Inactive",
      subtitle: "Start a new subscription to regain premium features",
      icon: "information-circle",
      color: "#6B7280"
    };
  };

  const status = getStatusDisplay();

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
        <Text style={styles.headerTitle}>FullCircle Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusCard, { borderColor: status.color }]}>
            <Ionicons name={status.icon as any} size={32} color={status.color} />
            <Text style={styles.statusTitle}>{status.title}</Text>
            <Text style={styles.statusSubtitle}>{status.subtitle}</Text>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {canCancel && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={isProcessing}
                >
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </TouchableOpacity>
              )}
              
              {canReactivate && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                  onPress={handleReactivate}
                  disabled={isProcessing}
                >
                  <Text style={styles.actionButtonText}>Reactivate</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadSubscriptionStatus}
                disabled={loadingStatus}
              >
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.refreshButtonText}>
                  {loadingStatus ? 'Checking...' : 'Refresh Status'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upgrade Options */}
        {showUpgradeOptions && (
          <View style={styles.upgradeSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            {/* Plans */}
            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={[
                  styles.planCard,
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
                  styles.yearlyPlan,
                  selectedPlan === 'yearly' && styles.planCardSelected
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
                <Text style={styles.planTitle}>Yearly</Text>
                <View style={styles.priceRow}>
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
                  <Text style={styles.subscribeButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.subscribeButtonText}>
                    Start FullCircle Premium
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.guaranteeText}>
              7-day money-back guarantee • Cancel anytime
            </Text>
          </View>
        )}

        {/* Features - Compact */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Ionicons name="infinite" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Unlimited Connections</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="eye" size={20} color={colors.primary} />
              <Text style={styles.featureText}>See Who Likes You</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="filter" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Advanced Filters</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="rocket" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Profile Boosts</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
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
    headerTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
    },
    scrollView: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['2xl'],
    },
    
    // Status Section
    statusSection: {
      marginBottom: Spacing.xl,
    },
    statusCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 2,
      alignItems: 'center',
    },
    statusTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    statusSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    
    // Action Buttons
    actionButtons: {
      width: '100%',
      gap: Spacing.md,
    },
    actionButton: {
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.base,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    cancelButtonText: {
      color: colors.textMuted,
      fontWeight: Typography.weights.medium,
      fontSize: Typography.sizes.base,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary + '30',
      borderRadius: BorderRadius.md,
      backgroundColor: colors.primary + '10',
    },
    refreshButtonText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.primary,
      fontWeight: Typography.weights.medium,
    },
    
    // Upgrade Section
    upgradeSection: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    plansContainer: {
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
    },
    planCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    yearlyPlan: {
      position: 'relative',
    },
    bestValueBadge: {
      position: 'absolute',
      top: -10,
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    bestValueText: {
      color: '#FFFFFF',
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
    },
    planTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    originalPrice: {
      fontSize: Typography.sizes.base,
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    planPrice: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
    },
    planPeriod: {
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
    },
    savings: {
      fontSize: Typography.sizes.sm,
      color: colors.primary,
      fontWeight: Typography.weights.semibold,
    },
    
    // Subscribe Button
    subscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.lg,
      marginBottom: Spacing.md,
    },
    subscribeButtonText: {
      color: '#FFFFFF',
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.lg,
    },
    guaranteeText: {
      textAlign: 'center',
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
    },
    
    // Features Section
    featuresSection: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
    },
    featuresList: {
      gap: Spacing.md,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    featureText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
    },
  });
};