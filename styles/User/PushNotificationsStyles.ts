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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7E7972",
  },
  headerRight: {
    width: 32,
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
  },
  rowDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  infoSection: {
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 32,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
});

export default styles;