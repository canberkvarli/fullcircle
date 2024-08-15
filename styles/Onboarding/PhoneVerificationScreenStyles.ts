import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 25,
    },
    title: {
      fontSize: 45,
      textAlign: "left",
      marginTop: 40,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    subtitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 40,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "left",
    },
    resendText: {
      color: "blue",
      marginLeft: 10,
    },
    codeContainer: {
      flexDirection: "row",
      marginBottom: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    codeInput: {
      borderBottomWidth: 1,
      borderBottomColor: "black",
      marginHorizontal: 4,
      width: 40,
      height: 40,
      fontSize: 24,
      textAlign: "center",
    },
    changeNumberLink: {
      textDecorationLine: "underline",
      marginTop: 16,
      textAlign: "center",
      color: "blue",
    },
    affirmation: {
      position: "absolute",
      bottom: 70,
      textAlign: "center",
      width: "100%",
      fontStyle: "italic",
      color: "gray",
    },
  });

export default styles;
