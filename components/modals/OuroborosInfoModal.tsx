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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.infoModalContent}>
              <View style={styles.infoModalHeader}>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.textDark} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.loaderContainer}>
                <OuroborosLoader
                  size={80}
                  duration={3000}
                  fillColor="#F5E6D3"
                  strokeColor="#B8860B"
                  strokeWidth={2}
                />
              </View>
              
              <Text style={styles.infoModalSubtitle}>
                The Ouroboros represents the eternal cycle of transformation and renewal
              </Text>
              
              <View style={styles.infoFeatures}>
                <Text style={styles.infoFeatureTitle}>The Sacred Symbol:</Text>
                <Text style={styles.infoFeatureText}>• Ancient symbol of infinite cycles</Text>
                <Text style={styles.infoFeatureText}>• Represents death and rebirth</Text>
                <Text style={styles.infoFeatureText}>• Symbolizes the unity of opposites</Text>
                <Text style={styles.infoFeatureText}>• Embodies eternal transformation</Text>
                <Text style={styles.infoFeatureText}>• Represents the cosmic dance of life</Text>
              </View>
              
              <View style={styles.infoFeatures}>
                <Text style={styles.infoFeatureTitle}>In Circle's Journey:</Text>
                <Text style={styles.infoFeatureText}>• Every ending is a new beginning</Text>
                <Text style={styles.infoFeatureText}>• Each connection transforms us</Text>
                <Text style={styles.infoFeatureText}>• We grow through relationships</Text>
                <Text style={styles.infoFeatureText}>• Love flows in infinite cycles</Text>
                <Text style={styles.infoFeatureText}>• Our spiritual path has no end</Text>
              </View>
              
              <Text style={styles.infoModalFooter}>
                "As the serpent eats its tail, so do we complete and renew ourselves through love"
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoModalContent: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
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
    infoModalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
      marginBottom: Spacing.lg,
    },
    closeButton: {
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loaderContainer: {
      marginVertical: Spacing.lg,
      alignItems: 'center',
    },
    infoModalSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      lineHeight: 22,
    },
    infoFeatures: {
      width: '100%',
      marginBottom: Spacing.lg,
    },
    infoFeatureTitle: {
      ...fonts.spiritualLargeTitleFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    infoFeatureText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      marginBottom: Spacing.xs,
      lineHeight: 18,
    },
    infoModalFooter: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 18,
    },
  });
}; 