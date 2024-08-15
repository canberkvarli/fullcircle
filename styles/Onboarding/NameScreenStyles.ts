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
      marginTop: 65,
      marginBottom: 30,
      paddingHorizontal: 16,
    },
    input: {
      height: 40,
      borderBottomWidth: 1,
      borderBottomColor: "black",
      marginHorizontal: 16,
      marginBottom: 20,
      fontSize: 16,
    },
    optionalText: {
      fontSize: 14,
      fontStyle: "italic",
      color: "gray",
      marginHorizontal: 16,
      marginBottom: 30,
    },
    linkText: {
      fontStyle: "normal",
      textDecorationLine: "underline",
      color: "blue",
    },
    affirmation: {
      top: 240,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
    },
    submitButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      borderRadius: 50,
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
export default styles;
