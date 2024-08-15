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
    unitToggleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
    },
    unitButton: {
      padding: 10,
      marginHorizontal: 10,
      borderWidth: 1,
      borderRadius: 5,
    },
    selectedUnitButton: {
      backgroundColor: "lightblue",
    },
    unitButtonText: {
      fontSize: 18,
    },
    heightInputs: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    heightValue: {
      fontSize: 30,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 20,
      marginBottom: 10,
    },
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      paddingHorizontal: 16,
    },
    hiddenText: {
      fontSize: 16,
      marginRight: 10,
    },
    checkbox: {
      alignSelf: "center",
      borderColor: "gray",
      borderWidth: 1,
      borderRadius: 5,
      width: 20,
      height: 20,
    },
    affirmation: {
      top: 110,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
    },
    nextButton: {
      position: "absolute",
      bottom: 30,
      right: 30,
      zIndex: 1,
    },
  });

export default styles;
