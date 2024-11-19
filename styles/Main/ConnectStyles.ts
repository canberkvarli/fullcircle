import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ageText: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  matchContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  dislikeButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "black",
    borderRadius: 50,
    padding: 10,
    borderColor: "white",
    borderWidth: 2,
    zIndex: 100,
  },
  dislikeIcon: {
    fontSize: 50,
    color: "white",
  },
  slider: {
    marginRight: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    height: 50,
    alignItems: "center",
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 10,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tab: {
    padding: 5,
    paddingBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "gray",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "black",
    fontWeight: "500",
  },
  caretIcon: {
    marginLeft: 5,
  },
  activeTab: {
    borderWidth: 2,
    borderColor: "black",
  },
  moreTab: {
    borderWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subheaderText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: "black",
    padding: 15,
    marginTop: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  applyButtonDisabled: {
    backgroundColor: "gray",
  },
});

export default styles;
