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
      paddingBottom: 140,
    },
    title: {
      fontSize: 45,
      textAlign: "left",
      marginTop: 40,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    option: {
      padding: 20,
      margin: 10,
      left: 30,
      borderRadius: 10,
      borderWidth: 1,
      width: 270,
      borderColor: "black",
    },
    optionSelected: {
      backgroundColor: "#d3d3d3",
    },
    optionTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    optionSubtitle: {
      fontSize: 16,
      fontStyle: "italic",
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      margin: 20,
    },
    dropdownButtonText: {
      fontSize: 18,
      marginRight: 10,
    },
    dropdown: {
      marginTop: 10,
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
      top: 110,
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
    input: {
      height: 40,
      borderBottomWidth: 1,
      borderBottomColor: "black",
      marginHorizontal: 16,
      marginBottom: 20,
      fontSize: 16,
    },
  });
  
export default styles;
