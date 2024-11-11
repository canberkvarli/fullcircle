import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 25,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    loadingIndicator: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    ageText: {
      fontSize: 18,
      marginHorizontal: 8,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    matchContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    nameText: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 10,
    },
    dislikeButton: {
      position: "absolute",
      bottom: 16,
      left: 16,
      backgroundColor: "black",
      borderRadius: 50,
      padding: 10,
      borderColor: "white",
      borderWidth: 2,
      zIndex: 100, // Ensures it's above other components
    },
    dislikeIcon: {
      fontSize: 50,
      color: "white",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      width: "80%",
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
    },
    modalSubtitle: {
      textAlign: "center",
      marginBottom: 20,
    },
    slider: {
      width: "100%",
      height: 40,
    },
  });

export default styles;
