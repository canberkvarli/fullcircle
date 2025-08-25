import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  useColorScheme,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

interface OuroborosInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OuroborosInfoModal({ visible, onClose }: OuroborosInfoModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView 
          style={styles.infoModalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color={colors.textDark} />
          </TouchableOpacity>
          
          {/* Ouroboros Animation */}
          <View style={styles.loaderContainer}>
            <OuroborosLoader
              size={80}
              duration={3000}
              fillColor="#F5E6D3"
              strokeColor="#B8860B"
              strokeWidth={2}
            />
          </View>
          
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
              The Ouroboros
            </Text>
          </View>
          
          {/* Main Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.descriptionText}>
              The ouroboros is an ancient symbol representing the eternal cycle of life, death, and rebirth.
            </Text>
            
            {/* Features */}
            <View style={styles.featuresContainer}>
              {/* Eternal Cycles */}
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="refresh" size={20} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Eternal Cycles</Text>
                  <Text style={styles.featureText}>
                    Everything in nature moves in cycles - seasons change, relationships evolve, and we continuously transform.
                  </Text>
                </View>
              </View>
              
              {/* Unity of Opposites */}
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="infinite" size={20} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Unity of Opposites</Text>
                  <Text style={styles.featureText}>
                    Beginnings and endings are connected, light and dark exist together, and we find wholeness by embracing all parts of ourselves.
                  </Text>
                </View>
              </View>
              
              {/* In Circle's Journey */}
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="heart" size={20} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>In Circle's Journey</Text>
                  <Text style={styles.featureText}>
                    Circle helps us grow through relationships. Each connection teaches us something new, and every ending opens the door to new beginnings.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>
                "As the serpent completes its circle, so do we find completion in our connections"
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.md,
    },
    infoModalContent: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      maxWidth: 400,
      width: '100%',
      maxHeight: '90%',
      borderWidth: 1,
      borderColor: colors.primary + '20',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 20,
        },
      }),
    },
    modalContentContainer: {
      padding: Spacing.xl,
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
      padding: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 1,
    },
    loaderContainer: {
      marginTop: Spacing.md,
      marginBottom: Spacing.md,
      alignItems: 'center',
    },
    titleContainer: {
      marginBottom: Spacing.md,
    },
    titleText: {
      ...fonts.spiritualLargeTitleFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.primary,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    contentContainer: {
      width: '100%',
      alignItems: 'center',
    },
    descriptionText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: Spacing.md,
      lineHeight: 22,
    },
    featuresContainer: {
      width: '100%',
      marginBottom: Spacing.md,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    featureIcon: {
      width: 36,
      height: 36,
      backgroundColor: colors.accent + '20',
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      flexShrink: 0,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      color: colorScheme === 'dark' ? colors.accent : colors.textDark,
      marginBottom: Spacing.xs,
    },
    featureText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      lineHeight: 18,
    },
    quoteContainer: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
      width: '100%',
    },
    quoteText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 18,
    },
  });
}; 