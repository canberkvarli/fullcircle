import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  userName: string;
}

const reportReasons = [
  { id: "inappropriate_photos", label: "Inappropriate photos", icon: "image-outline" },
  { id: "fake_profile", label: "Fake profile", icon: "person-remove-outline" },
  { id: "harassment", label: "Harassment or offensive messages", icon: "warning-outline" },
  { id: "spam", label: "Spam or solicitation", icon: "mail-unread-outline" },
  { id: "underage", label: "User appears to be under 18", icon: "shield-outline" },
  { id: "threatening", label: "Threatening or violent behavior", icon: "alert-circle-outline" },
  { id: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onSubmit,
  userName,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    setShowDetails(true);
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert(
        "Please select a reason",
        "You must select a reason for reporting.",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
      return;
    }

    onSubmit(selectedReason, additionalDetails);

    // Reset state
    setSelectedReason("");
    setAdditionalDetails("");
    setShowDetails(false);

    Alert.alert(
      "Report Submitted",
      "Thank you for helping keep our community safe. We'll review this report and take appropriate action.",
      [{ text: "OK", onPress: onClose, style: "default" }],
      { cancelable: false }
    );
  };

  const handleClose = () => {
    setSelectedReason("");
    setAdditionalDetails("");
    setShowDetails(false);
    onClose();
  };

  const styles = createStyles(colors, fonts);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8B4513" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Report {userName}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {!showDetails ? (
            <>
              <View style={styles.introSection}>
                <View style={[styles.warningIcon, { backgroundColor: '#8B4513' + '15' }]}>
                  <Ionicons name="shield-checkmark" size={32} color="#8B4513" />
                </View>
                <Text style={[styles.subtitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                  Help us maintain our community
                </Text>
                <Text style={[styles.description, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Your report helps protect everyone in our community. Please select the reason that best describes the issue.
                </Text>
              </View>

              <ScrollView 
                style={styles.reasonsList}
                showsVerticalScrollIndicator={false}
              >
                {reportReasons.map((reason, index) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem, 
                      { 
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        marginBottom: index === reportReasons.length - 1 ? Spacing.xl : Spacing.md
                      }
                    ]}
                    onPress={() => handleReasonSelect(reason.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reasonContent}>
                      <View style={[styles.reasonIconContainer, { backgroundColor: '#8B4513' + '10' }]}>
                        <Ionicons name={reason.icon as any} size={20} color="#8B4513" />
                      </View>
                      <Text style={[styles.reasonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        {reason.label}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailsContainer}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowDetails(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color="#8B4513" />
                <Text style={[styles.backText, fonts.spiritualBodyFont, { color: "#8B4513" }]}>
                  Back
                </Text>
              </TouchableOpacity>

              <View style={styles.detailsHeader}>
                <View style={[styles.selectedReasonIcon, { backgroundColor: '#8B4513' + '15' }]}>
                  <Ionicons 
                    name={reportReasons.find((r) => r.id === selectedReason)?.icon as any} 
                    size={28} 
                    color="#8B4513" 
                  />
                </View>
                <Text style={[styles.detailsTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  {reportReasons.find((r) => r.id === selectedReason)?.label}
                </Text>
              </View>

              <Text style={[styles.detailsSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                Please provide any additional details that might help us understand the situation better (optional)
              </Text>

              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.textDark,
                  fontFamily: fonts.spiritualBodyFont?.fontFamily,
                }]}
                placeholder="Share more context to help us understand..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
                textAlignVertical="top"
                maxLength={500}
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#8B4513" }]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={[styles.submitButtonText, fonts.spiritualBodyFont]}>
                  Submit Report
                </Text>
              </TouchableOpacity>

              <View style={[styles.disclaimerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="information-circle" size={16} color={colors.textMuted} style={styles.disclaimerIcon} />
                <Text style={[styles.disclaimer, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                  Reports are anonymous and confidential. We'll review this within 24 hours and take appropriate action if our community guidelines have been violated.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    maxHeight: "90%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  introSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.4,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  reasonsList: {
    paddingHorizontal: Spacing.xl,
    maxHeight: 400,
  },
  reasonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reasonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reasonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  reasonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    flex: 1,
    letterSpacing: 0.2,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    padding: Spacing.sm,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
    letterSpacing: 0.3,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  selectedReasonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailsTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  detailsSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.4,
    marginBottom: Spacing.xl,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  textInput: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    fontSize: Typography.sizes.base,
    minHeight: 120,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitIcon: {
    marginRight: Spacing.sm,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  disclaimerIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.sizes.xs * 1.4,
    flex: 1,
    letterSpacing: 0.2,
  },
});

export default ReportModal;