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
    scrollContainer: {
      paddingBottom: 20,
      alignItems: "center",
    },
    ethnicityOption: {
      padding: 12,
      borderWidth: 1,
      borderRadius: 5,
      marginVertical: 5,
      width: "100%",
    },
    selectedEthnicity: {
      backgroundColor: "lightblue",
    },
    ethnicityText: {
      fontSize: 16,
    },
    otherInput: {
      padding: 12,
      borderWidth: 1,
      borderRadius: 5,
      marginVertical: 5,
      width: "100%", // Ensure full width in the container
    },
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginTop: 10,
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
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
      paddingBottom: 50,
      marginTop: 10,
    },
    nextButton: {
      position: "absolute",
      bottom: 16,
      right: 16,
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default styles;
