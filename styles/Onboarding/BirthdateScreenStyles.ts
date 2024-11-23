import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 25,
    backgroundColor: "#EDE9E3",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "left",
    color: "#7E7972",
    marginTop: 80,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#7E7972",
    textAlign: "left",
    marginBottom: 24,
  },
  dateInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 50,
    marginBottom: 60,
  },
  dateValue: {
    textAlign: "center",
    lineHeight: 40,
    height: 50,
  },
  ageText: {
    fontSize: 18,
    color: "#7E7972",
    textAlign: "center",
    marginBottom: 8,
  },
  warning: {
    fontSize: 14,
    color: "#D8BFAA",
    textAlign: "center",
    marginBottom: 16,
  },
  affirmation: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#B8C1B2",
    textAlign: "center",
    marginTop: 50,
  },
  nextButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#D8BFAA",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
});

export default styles;
