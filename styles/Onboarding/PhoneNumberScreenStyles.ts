import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 25,
    },
    mainContent: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      marginTop: 25,
    },
    bottomBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: 16,
      position: "absolute",
      bottom: 0,
      right: 0,
    },
    phoneContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      width: "80%",
      marginRight: 50,
    },
    countryInputContainer: {
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      marginRight: 10,
    },
    phoneInput: {
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      backgroundColor: "transparent",
    },
    textContainer: {
      backgroundColor: "transparent",
    },
    codeText: {
      color: "black",
    },
    phoneNumberInput: {
      flex: 1,
      height: 40,
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      marginLeft: 10,
    },
    title: {
      fontSize: 45,
      marginTop: 16,
      marginLeft: 35,
      textAlign: "left",
    },
    subtitle: {
      fontSize: 16,
      marginTop: 20,
      textAlign: "center",
      marginBottom: 20,
    },
    notificationText: {
      fontSize: 12,
      marginTop: 16,
      textAlign: "center",
      color: "gray",
    },
    affirmationContainer: {
      position: "absolute",
      bottom: 70, // Adjust as needed to position above the nextButton
      left: 0,
      right: 0,
      paddingHorizontal: 16,
    },
    affirmation: {
      fontSize: 16,
      textAlign: "center",
      fontStyle: "italic",
    },
    nextButton: {
      padding: 12,
      borderRadius: 30,
    },
    backButton: {
      marginTop: 20,
      marginLeft: 16,
    },
  });

export default styles;
