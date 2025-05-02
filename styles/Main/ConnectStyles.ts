import { StyleSheet } from "react-native";

export const primaryColor = "#EDE9E3";
const secondaryColor = "#B8C1B2";
const highlightColor = "#D8BFAA";
const darkNeutral = "#7E7972";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    padding: 16,
    backgroundColor: primaryColor,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingIndicator: {
    marginBottom: 150,
    alignSelf: "center",
  },
  ageText: {
    fontSize: 18,
    marginHorizontal: 8,
    textAlign: "center",
    color: darkNeutral,
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
    color: darkNeutral,
  },
  dislikeButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: darkNeutral,
    borderRadius: 50,
    padding: 10,
    borderColor: primaryColor,
    borderWidth: 2,
    zIndex: 100,
  },
  dislikeIcon: {
    fontSize: 50,
    color: primaryColor,
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
  tab: {
    padding: 5,
    paddingBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: secondaryColor,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: darkNeutral,
    fontWeight: "500",
  },
  caretIcon: {
    marginLeft: 5,
    color: "#7E7972",
  },
  activeTab: {
    borderWidth: 2,
    borderColor: highlightColor,
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
    color: darkNeutral,
  },
  subheaderText: {
    fontSize: 14,
    color: secondaryColor,
    textAlign: "center",
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: highlightColor,
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
  rangeText: {
    fontSize: 16,
    color: darkNeutral,
    textAlign: "center",
    marginTop: 10,
  },
  heightRangeContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  heightRangeText: {
    fontSize: 16,
    color: darkNeutral,
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
    color: secondaryColor,
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
    borderColor: secondaryColor,
    borderWidth: 1,
  },
  disabledSliderText: {
    color: secondaryColor,
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
    color: darkNeutral,
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
    color: darkNeutral,
    marginTop: 10,
    textAlign: "center",
  },
  subscribeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#6A4C93",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#6A4C93",
    marginRight: 10,
    marginTop: 15,
  },
  subscribeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: primaryColor,
  },
  noMatchesText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: darkNeutral,
    marginBottom: 10,
  },
  noMatchesSubText: {
    fontSize: 16,
    textAlign: "center",
    color: secondaryColor,
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: highlightColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  filtersButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: secondaryColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  filtersButtonText: {
    color: darkNeutral,
    fontWeight: "bold",
    fontSize: 16,
  },

  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 11,
  },
  animation: {
    width: 250,
    height: 250,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 10,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
});

export default styles;
