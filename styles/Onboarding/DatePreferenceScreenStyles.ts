import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 25,
    },
    backButton: {
      bottom: 40,
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
    preferenceContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 30,
    },
    preferenceButton: {
      padding: 10,
      borderWidth: 1,
      borderRadius: 5,
    },
    selectedButton: {
      backgroundColor: "lightblue",
    },
    preferenceText: {
      fontSize: 18,
    },
    selectedText: {
      color: "white",
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
      bottom: 30,
      right: 30,
      zIndex: 1,
    },
  });
  
export default styles;
