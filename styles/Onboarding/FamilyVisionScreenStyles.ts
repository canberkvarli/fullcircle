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
    optionsContainer: {
      marginBottom: 20,
    },
    optionButton: {
      padding: 10,
      marginVertical: 5,
      borderWidth: 1,
      borderRadius: 5,
    },
    selectedOptionButton: {
      backgroundColor: "lightblue",
    },
    optionText: {
      fontSize: 18,
      textAlign: "center",
    },
    selectedOptionText: {
      fontWeight: "bold",
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
      top: 140,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
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
