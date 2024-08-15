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
    scrollViewContent: {
      paddingBottom: 100,
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
    minititle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 16,
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginVertical: 20,
    },
    optionButton: {
      flexBasis: "45%",
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "gray",
      borderRadius: 5,
      margin: 5,
    },
    selectedOption: {
      backgroundColor: "lightblue",
    },
    optionText: {
      fontSize: 16,
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
      marginLeft: 10,
    },
    affirmation: {
      bottom: 40,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
    },
    submitButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default styles;
