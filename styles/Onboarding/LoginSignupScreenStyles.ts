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
      width: 150,
      height: 150,
      tintColor: '#FFFFFF',
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
      borderRadius: 30, // Rounded corners
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginTop: 10,
      elevation: 5, // Shadow effect for Android
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    primaryButton: {
      backgroundColor: '#8A2BE2', // Deep violet color for a modern look
    },
    secondaryButton: {
      backgroundColor: '#6A5ACD', // Slightly lighter tone for contrast
    },
    buttonText: {
      color: '#FFFFFF', // White text
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
export default styles;
