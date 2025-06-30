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
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  isHighlighted = false,
  delay = 0 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const styles = createFeatureCardStyles(colorScheme, isHighlighted);

  return (
    <Animated.View 
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      {isHighlighted && (
        <View style={styles.highlightBadge}>
          <Text style={styles.badgeText}>✨</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default function FullCircleSubscription() {
  const router = useRouter();
  const { userData } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUpgrade = () => {
    console.log(`Redirecting to Stripe checkout for ${selectedPlan} plan...`);
    // Navigation to Stripe checkout (placeholder)
    // router.push(`/user/checkout?plan=${selectedPlan}`);
  };

  const premiumFeatures = [
    {
      icon: "infinite-outline",
      title: "Unlimited Orbs",
      description: "Send unlimited special likes to catch someone's attention",
      isHighlighted: true
    },
    {
      icon: "heart-outline",
      title: "Unlimited Likes",
      description: "Like as many profiles as your heart desires"
    },
    {
      icon: "rocket-outline",
      title: "Profile Boosts",
      description: "Get 5x more visibility with weekly profile boosts"
    },
    {
      icon: "eye-outline",
      title: "See Who Likes You",
      description: "View all your admirers without the blur effect"
    },
    {
      icon: "filter-outline",
      title: "Advanced Filters",
      description: "Fine-tune your preferences for perfect matches"
    },
    {
      icon: "sparkles-outline",
      title: "Premium Badge",
      description: "Stand out with an exclusive FullCircle member badge"
    },
    {
      icon: "headset-outline",
      title: "Priority Support",
      description: "Get faster response times from our support team"
    },
    {
      icon: "people-outline",
      title: "Exclusive Community",
      description: "Access to members-only events and features"
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { transform: [{ translateY: headerAnim }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FullCircle</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: contentAnim,
              transform: [{ scale: contentAnim }] 
            }
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="infinite" size={48} color={colors.primary} />
            </View>
            <Text style={styles.mainTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.subtitle}>
              Experience deeper connections with FullCircle's premium features designed for spiritual souls
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What You'll Get</Text>
            <View style={styles.featuresGrid}>
              {premiumFeatures.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  isHighlighted={feature.isHighlighted}
                  delay={index * 100}
                />
              ))}
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            {/* Plan Selector */}
            <View style={styles.planSelector}>
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'monthly' && styles.planOptionSelected
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={[
                  styles.planOptionText,
                  selectedPlan === 'monthly' && styles.planOptionTextSelected
                ]}>
                  Monthly
                </Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === 'monthly' && styles.planPriceSelected
                ]}>
                  $29.99
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'yearly' && styles.planOptionSelected
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
                <Text style={[
                  styles.planOptionText,
                  selectedPlan === 'yearly' && styles.planOptionTextSelected
                ]}>
                  Yearly
                </Text>
                <Text style={[
                  styles.planPrice,
                  selectedPlan === 'yearly' && styles.planPriceSelected
                ]}>
                  $199.99
                </Text>
                <Text style={styles.savings}>Save 44%</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>
                Start Your FullCircle Journey
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.ctaDescription}>
              Join thousands of spiritual beings who've found their perfect match through FullCircle
            </Text>
            
            <View style={styles.guaranteeSection}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.guaranteeText}>
                7-day money-back guarantee • Cancel anytime
              </Text>
            </View>
          </View>

          {/* Social Proof */}
          <View style={styles.socialProofSection}>
            <Text style={styles.testimonialQuote}>
              "FullCircle helped me find not just love, but my spiritual soulmate. The advanced matching is incredible!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah M., FullCircle Member</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createFeatureCardStyles = (colorScheme: 'light' | 'dark', isHighlighted: boolean) => {
  const colors = Colors[colorScheme];
  const { buttonFont, captionFont } = useFont();
  
  return StyleSheet.create({
    featureCard: {
      backgroundColor: isHighlighted ? colors.primary + '15' : colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isHighlighted ? 2 : 1,
      borderColor: isHighlighted ? colors.primary : colors.border,
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    featureTitle: {
      ...buttonFont,
      color: colors.textDark, // FIXED: was colors.text (pure white)
      marginBottom: Spacing.xs,
      fontWeight: '600',
    },
    featureDescription: {
      ...captionFont,
      color: colors.textMuted, // This was already correct
      lineHeight: Typography.sizes.sm * 1.3,
    },
    highlightBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 12,
    },
  });
};

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  const { logoFont, buttonFont, captionFont, affirmationFont, spiritualSubtitleFont } = useFont();
  
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
      paddingBottom: Spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...logoFont,
      color: colors.textDark, // FIXED: was colors.text (pure white)
      textAlign: 'center',
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      paddingBottom: Spacing.xl,
    },
    content: {
      paddingHorizontal: Spacing.lg,
    },
    
    // Hero Section
    heroSection: {
      alignItems: 'center',
      paddingVertical: Spacing['2xl'],
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    mainTitle: {
      ...logoFont,
      color: colors.textDark, // FIXED: was colors.text (pure white)
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...spiritualSubtitleFont,
      color: colors.textLight, // FIXED: This was textMuted, now using the improved textLight
      textAlign: 'center',
      lineHeight: Typography.sizes.lg * 1.4,
      paddingHorizontal: Spacing.md,
    },
    
    // Features Section
    featuresSection: {
      marginBottom: Spacing['2xl'],
    },
    sectionTitle: {
      ...affirmationFont,
      color: colors.textDark, // FIXED: was colors.text (pure white)
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    featuresGrid: {
      gap: Spacing.xs,
    },
    
    // Pricing Section
    pricingSection: {
      marginBottom: Spacing['2xl'],
    },
    planSelector: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    planOption: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      position: 'relative',
    },
    planOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    planOptionText: {
      ...buttonFont,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
    },
    planOptionTextSelected: {
      color: colors.textDark, // FIXED: was colors.text (pure white)
      fontWeight: '600',
    },
    planPrice: {
      ...logoFont,
      color: colors.textDark, // FIXED: was colors.text (pure white)
      fontSize: Typography.sizes.xl,
    },
    planPriceSelected: {
      color: colors.primary,
    },
    popularBadge: {
      position: 'absolute',
      top: -12,
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    popularBadgeText: {
      ...captionFont,
      color: '#FFFFFF',
      fontSize: Typography.sizes.xs,
      fontWeight: '700',
    },
    savings: {
      ...captionFont,
      color: colors.primary,
      marginTop: Spacing.xs,
      fontWeight: '600',
    },
    
    // CTA Section
    ctaSection: {
      alignItems: 'center',
      marginBottom: Spacing['2xl'],
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
      minWidth: width * 0.8,
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
      ...buttonFont,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: Typography.sizes.base,
    },
    ctaDescription: {
      ...spiritualSubtitleFont,
      color: colors.textLight, // FIXED: was textMuted, now using improved textLight
      textAlign: 'center',
      lineHeight: Typography.sizes.base * 1.4,
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.md,
    },
    guaranteeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.card,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    guaranteeText: {
      ...captionFont,
      color: colors.textMuted,
      fontSize: Typography.sizes.sm,
    },
    
    // Social Proof
    socialProofSection: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    testimonialQuote: {
      ...spiritualSubtitleFont,
      color: colors.textDark, // FIXED: was colors.text (pure white)
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: Spacing.sm,
      lineHeight: Typography.sizes.lg * 1.4,
    },
    testimonialAuthor: {
      ...captionFont,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
};