import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE9E3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#EDE9E3",
    borderBottomWidth: 1,
    borderBottomColor: "#D3C6BA",
  },
  headerLeft: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7E7972",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowContent: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  editText: {
    fontSize: 16,
    color: "#D8BFAA",
    fontWeight: "500",
  },
  expandableContent: {
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  expandedText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: "#D3C6BA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: "#D8BFAA",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  verifyRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  verifyText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  bottomSection: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutText: {
    fontSize: 18,
    color: "#7E7972",
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  deleteText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  verificationInput: {
    borderWidth: 1,
    borderColor: "#D3C6BA",
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#D8BFAA",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteModalButton: {
    backgroundColor: "#FF6B6B",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  reasonOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  reasonOptionSelected: {
    borderColor: "#D8BFAA",
    backgroundColor: "#F5F0EA",
  },
  reasonText: {
    fontSize: 16,
    color: "#666",
  },
  reasonTextSelected: {
    color: "#7E7972",
    fontWeight: "500",
  },
});

export default styles;