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
    textAlign: "center",
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
  subheaderTextBold: {
    fontWeight: "bold",
  },
  heightRangeContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  heightRangeText: {
    fontSize: 16,
    color: "black",
    marginBottom: 10,
  },
  heightRange: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heightRangeSlider: {
    flex: 1,
    marginRight: 10,
  },
  subscriberMessage: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
    textAlign: "center",
  },
  applyButtonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  lockIcon: {
    marginRight: 5,
  },
  disabledSlider: {
    width: 280,
    height: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
  },
  disabledSliderText: {
    color: "gray",
    fontSize: 14,
    textAlign: "center",
  },
  overlayMessage: {
    backgroundColor: "#fafafa",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  overlayText: {
    color: "black",
    fontSize: 16,
    textAlign: "center",
  },
  upgradeLink: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  heightText: {
    fontSize: 16,
    color: "black",
    marginTop: 10,
    textAlign: "center",
  },
  subscribeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "purple",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "purple",
    marginRight: 10,
    marginTop: 15,
  },
  subscribeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;
