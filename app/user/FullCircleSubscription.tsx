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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";

const { width } = Dimensions.get('window');

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
  const { userData } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple, subtle fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpgrade = () => {
    console.log(`Redirecting to Stripe checkout for ${selectedPlan} plan...`);
    // Navigation to Stripe checkout (placeholder)
    // router.push(`/user/checkout?plan=${selectedPlan}`);
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
      {/* Simple Header */}
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
            <Ionicons name="sparkles" size={32} color={colors.primary} />
          </View>
          <Text style={styles.mainTitle}>Deepen Your Connections</Text>
          <Text style={styles.subtitle}>
            Unlock advanced features designed for meaningful spiritual connections
          </Text>
        </View>

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

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {/* Plan Cards */}
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
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>
              Start Your FullCircle Journey
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.guaranteeSection}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={styles.guaranteeText}>
              7-day money-back guarantee • Cancel anytime
            </Text>
          </View>
        </View>

        {/* Simple Testimonial */}
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
    headerTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
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
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
      width: '100%',
      justifyContent: 'center',
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
  });
};