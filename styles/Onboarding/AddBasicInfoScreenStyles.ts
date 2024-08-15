import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Adding a dark overlay for better text visibility
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
    title: {
      fontSize: 36,
      color: "white",
      textAlign: "center",
      marginBottom: 10,
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 20,
      color: "white",
      textAlign: "center",
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    bottomContainer: {
      position: "absolute",
      bottom: 40,
      width: "100%",
      alignItems: "center",
    },
    affirmation: {
      color: "white",
      fontSize: 18,
      fontStyle: "italic",
      marginBottom: 20,
    },
    continueButton: {
      backgroundColor: "#FFD700",
      paddingVertical: 15,
      paddingHorizontal: 80,
      borderRadius: 50,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.39,
      shadowRadius: 8.3,
      elevation: 13,
    },
    continueButtonText: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
    },
  });

export default styles;
