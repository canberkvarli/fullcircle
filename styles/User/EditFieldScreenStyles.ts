import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
    justifyContent: "flex-start",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  input: {
    borderColor: "gray",
    borderBottomWidth: 1,
    padding: 8,
    marginVertical: 8,
  },
  workInput: {
    fontSize: 38,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 8,
  },
  optionalText: {
    fontSize: 14,
    color: "black",
    marginTop: 8,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  visibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  visibilityText: {
    fontSize: 16,
  },
  ageContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  ageText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  birthdateText: {
    fontSize: 18,
    marginVertical: 8,
  },
  noticeText: {
    fontSize: 14,
    marginTop: 12,
  },
  heightPickerContainer: {
    marginBottom: 24,
  },
  unitToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  activeUnit: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#6200ea",
    marginHorizontal: 8,
  },
  inactiveUnit: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  unitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  mapContainer: {
    width: "100%",
    height: 500,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  regionName: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -100 }],
    backgroundColor: "#000",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  // Loading Indicator Style
  loadingIndicator: {
    alignSelf: "center",
    marginTop: 20,
  },
});

export default styles;
