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
      marginTop: 50,
      marginBottom: 30,
      paddingHorizontal: 16,
    },
    subtitle: {
      fontSize: 18,
      textAlign: "left",
      paddingHorizontal: 16,
      marginBottom: 30,
    },
    educationInputs: {
      flex: 1,
      justifyContent: "center",
      marginBottom: 20,
      bottom: 10,
    },
    optionContainer: {
      padding: 15,
      marginVertical: 5,
      borderWidth: 1,
      borderRadius: 5,
    },
    optionText: {
      fontSize: 18,
      textAlign: "center",
    },
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      paddingHorizontal: 16,
    },
    hiddenText: {
      fontSize: 18,
    },
    checkbox: {
      width: 20,
      height: 20,
      left: 10,
    },
    affirmation: {
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
      paddingBottom: 50,
      marginTop: 10,
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
