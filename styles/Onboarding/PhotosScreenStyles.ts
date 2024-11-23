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
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 130,
    height: 130,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#D3C6BA",
    justifyContent: "center",
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 4,
  },
  nextButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 1,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
  },
});

export default styles;
