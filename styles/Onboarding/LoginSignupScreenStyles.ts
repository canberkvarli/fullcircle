import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backgroundVideo: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay to make text more readable
    },
    loadingIndicator: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    affirmation: {
      fontSize: 18,
      color: "#fff",
      textAlign: "center",
      marginVertical: 10,
    },
    infoText: {
      fontSize: 12,
      color: "#fff",
      textAlign: "center",
      marginVertical: 20,
    },
    link: {
      color: "#add8e6",
      textDecorationLine: "underline",
    },
    button: {
      width: "80%",
      paddingVertical: 15,
      marginVertical: 10,
      borderRadius: 5,
      alignItems: "center",
    },
    primaryButton: {
      backgroundColor: "#4caf50",
      width: 150,
    },
    secondaryButton: {
      backgroundColor: "#8a2be2",
      width: 150,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
    },
  });
  
export default styles;
