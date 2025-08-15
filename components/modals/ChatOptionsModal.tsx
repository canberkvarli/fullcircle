import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { height: screenHeight } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  onUnmatch: () => void;
  onReport: () => void;
};

export default function ChatOptionsModal({
  visible,
  onClose,
  onUnmatch,
  onReport,
}: Props) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleUnmatch = () => {
    if (isProcessing) return;

    Alert.alert(
      "End Connection",
      "Are you sure you want to unmatch? This action cannot be undone and your conversation will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              onClose(); // Close modal immediately
              await onUnmatch(); // Then execute unmatch
            } catch (error) {
              console.error("Error unmatching:", error);
              Alert.alert(
                "Error",
                "Something went wrong. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleReport = () => {
    if (isProcessing) return;
    
    onClose(); // Close this modal first
    setTimeout(() => {
      onReport(); // Then open report modal
    }, 100);
  };

  const styles = createStyles(colors, fonts);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.sheet, 
          { 
            backgroundColor: colors.background,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.handle} />
          <Text style={[styles.headerTitle, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
            Chat Options
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Unmatch Option */}
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleUnmatch}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#FF6B6B' + '15' }]}>
              <Ionicons name="heart-dislike" size={20} color="#FF6B6B" />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, fonts.spiritualBodyFont, { color: '#FF6B6B' }]}>
                End Connection
              </Text>
              <Text style={[styles.optionSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Permanently remove this match and conversation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Report Option */}
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleReport}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#FFA500' + '15' }]}>
              <Ionicons name="flag" size={20} color="#FFA500" />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, fonts.spiritualBodyFont, { color: '#FFA500' }]}>
                Report User
              </Text>
              <Text style={[styles.optionSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Report inappropriate behavior or content
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Cancel Option */}
          <TouchableOpacity
            style={[styles.cancelOption, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#8B4513' + '15' }]}>
              <Ionicons name="close" size={20} color="#8B4513" />
            </View>
            <Text style={[styles.cancelText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for safe area */}
        <View style={styles.bottomSpacing} />
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    paddingHorizontal: Spacing.xl,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.2,
  },
  optionSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
    letterSpacing: 0.1,
  },
  cancelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
    letterSpacing: 0.2,
  },
  bottomSpacing: {
    height: 20, // Safe area spacing
  },
});