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
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  userName: string;
}

const reportReasons = [
  { id: "inappropriate_photos", label: "Inappropriate photos" },
  { id: "fake_profile", label: "Fake profile" },
  { id: "harassment", label: "Harassment or offensive messages" },
  { id: "spam", label: "Spam or solicitation" },
  { id: "underage", label: "User appears to be under 18" },
  { id: "threatening", label: "Threatening or violent behavior" },
  { id: "other", label: "Other" },
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

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    setShowDetails(true);
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert(
        "Please select a reason",
        "You must select a reason for reporting."
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
      [{ text: "OK", onPress: onClose }]
    );
  };

  const handleClose = () => {
    setSelectedReason("");
    setAdditionalDetails("");
    setShowDetails(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="times" size={24} color="#7E7972" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report {userName}</Text>
            <View style={styles.placeholder} />
          </View>

          {!showDetails ? (
            <>
              <Text style={styles.subtitle}>
                Help us understand what's happening
              </Text>

              <ScrollView style={styles.reasonsList}>
                {reportReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={styles.reasonItem}
                    onPress={() => handleReasonSelect(reason.id)}
                  >
                    <Text style={styles.reasonText}>{reason.label}</Text>
                    <Icon name="chevron-right" size={16} color="#B8C1B2" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowDetails(false)}
              >
                <Icon name="chevron-left" size={20} color="#7E7972" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.detailsTitle}>
                {reportReasons.find((r) => r.id === selectedReason)?.label}
              </Text>

              <Text style={styles.detailsSubtitle}>
                Please provide any additional details that might help us
                (optional)
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="Add more context..."
                placeholderTextColor="#B8C1B2"
                multiline
                numberOfLines={4}
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Reports are anonymous. We'll review this within 24 hours and
                take appropriate action if our community guidelines have been
                violated.
              </Text>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#EDE9E3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7E7972",
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#7E7972",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reasonsList: {
    paddingHorizontal: 20,
  },
  reasonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D3C6BA",
  },
  reasonText: {
    fontSize: 16,
    color: "#7E7972",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: "#7E7972",
    marginLeft: 8,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: "#7E7972",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: "#7E7972",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#D3C6BA",
  },
  submitButton: {
    backgroundColor: "#D8BFAA",
    borderRadius: 25,
    paddingVertical: 14,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disclaimer: {
    fontSize: 12,
    color: "#B8C1B2",
    paddingHorizontal: 20,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default ReportModal;
