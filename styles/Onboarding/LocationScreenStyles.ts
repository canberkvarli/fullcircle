import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 25,
    },
    backButton: {
      bottom: 20,
    },
    title: {
      fontSize: 45,
      textAlign: "left",
      marginTop: 40,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    subtitle: {
      fontSize: 18,
      textAlign: "left",
      paddingHorizontal: 16,
      marginBottom: 30,
    },
    regionName: {
      fontSize: 16,
      marginBottom: 16,
      textAlign: "center",
    },
    mapContainer: {
      width: "100%",
      height: 300,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 20,
      position: "relative",
    },
    map: {
      width: "100%",
      height: "100%",
    },
    markerFixed: {
      position: "absolute",
      left: "50%",
      top: "50%",
      marginLeft: -20,
      marginTop: -40,
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
    affirmation: {
      top: 10,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
    },
    continueButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingIndicator: {
      justifyContent: "center",
      top: "30%",
    },
  });
  
export default styles;
