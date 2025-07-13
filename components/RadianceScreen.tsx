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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";

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
          backgroundColor: isSelected ? colors.primary + '15' : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {tag && (
        <View style={[styles.tagBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.tagText, fonts.spiritualBodyFont]}>{tag}</Text>
        </View>
      )}
      
      <View style={styles.boostHeader}>
        <View style={styles.boostIconContainer}>
          <Ionicons name="radio-outline" size={24} color={colors.primary} />
          <Text style={[styles.boostCount, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            {boostCount}
          </Text>
        </View>
        <Text style={[styles.boostLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
          Sacred Radiance{boostCount > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.pricingContainer}>
        <Text style={[styles.pricePerBoost, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          ${pricePerBoost.toFixed(2)} each
        </Text>
        <Text style={[styles.totalPrice, fonts.spiritualTitleFont, { color: colors.primary }]}>
          ${totalPrice.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          { 
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: colors.primary,
            borderWidth: 1
          }
        ]}
        onPress={onSelect}
        activeOpacity={0.9}
      >
        <Text style={[
          styles.selectButtonText,
          fonts.spiritualBodyFont,
          { color: isSelected ? '#FFFFFF' : colors.primary }
        ]}>
          Get {boostCount} for ${totalPrice.toFixed(2)}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

interface RadianceScreenProps {
  visible: boolean;
  onClose: () => void;
}

const RadianceScreen: React.FC<RadianceScreenProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { userData, purchaseRadiance } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
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
    setIsProcessing(true);
    const option = boostOptions[selectedOption];
    
    try {
      // This would integrate with your payment system
      await purchaseRadiance(option.boostCount, option.totalPrice);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Sacred Radiance
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="radio-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.mainTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Radiate Your Energy
            </Text>
            <Text style={[styles.subtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              Each Sacred Radiance gets you seen by 11x more souls for one sacred hour
            </Text>
          </View>

          {/* Boost Options */}
          <View style={styles.optionsSection}>
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
          </View>

          {/* How it Works */}
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              How Sacred Radiance Works
            </Text>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="trending-up" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.infoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Your profile appears first in discovery for 60 minutes
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.infoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Get 11x more profile views from compatible souls
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="heart" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.infoText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Track radiance-powered connections in Kindred Spirits
                </Text>
              </View>
            </View>
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              { 
                backgroundColor: isProcessing ? colors.textMuted : colors.primary,
                shadowColor: colors.primary
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
                  Activating Radiance...
                </Text>
              </View>
            ) : (
              <View style={styles.purchaseContainer}>
                <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                <Text style={[styles.purchaseButtonText, fonts.spiritualBodyFont]}>
                  Activate Sacred Radiance
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={[styles.trustText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Secure payment
              </Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.trustText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Cancel anytime
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

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
  
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  
  scrollView: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  mainTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  subtitle: {
    fontSize: Typography.sizes.lg,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.4,
    paddingHorizontal: Spacing.md,
  },
  
  // Options Section
  optionsSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  
  boostOption: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    position: 'relative',
  },
  
  tagBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
  
  boostIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  boostCount: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },
  
  boostLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  
  pricingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  pricePerBoost: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  
  totalPrice: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
  },
  
  selectButton: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  
  selectButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  
  // Info Section
  infoSection: {
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
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