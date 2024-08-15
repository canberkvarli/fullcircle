import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 25,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    headerButton: {
      fontSize: 16,
    },
    tabBar: {
      flexDirection: "row",
      marginBottom: 16,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
    },
    activeTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: "#007AFF",
    },
    tabText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    editContainer: {
      flex: 1,
    },
    photosContainer: {
      flexDirection: "row",
      marginBottom: 16,
    },
    photoList: {
      flex: 1,
    },
    photoContainer: {
      flex: 1,
      position: "relative",
      margin: 2,
    },
    photoWrapper: {
      position: "relative",
    },
    photo: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    removePhotoIcon: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: 12,
      padding: 4,
    },
    fieldsContainer: {
      marginTop: 16,
    },
    mainTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "gray",
    },
    separator: {
      height: 1,
      backgroundColor: "lightgray",
      marginVertical: 8,
    },
    contentContainer: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
    },
  });

export default styles;
