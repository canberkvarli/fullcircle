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
    dateInputs: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginBottom: 20,
    },
    dateValue: {
      fontSize: 24,
      height: 40,
      textAlign: "center",
      lineHeight: 40,
    },
    ageText: {
      fontSize: 18,
      marginBottom: 16,
      textAlign: "center",
    },
    warning: {
      fontSize: 15,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
    },
    affirmation: {
      position: "absolute",
      bottom: 85,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
      left: 15,
    },
    nextButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
export default styles;
