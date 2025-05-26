import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#EDE9E3",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  icons: {
    flexDirection: "row",
  },
  iconSpacing: {
    marginLeft: 16,
  },
  preferencesIcon: {
    marginRight: 16,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "black",
    borderRadius: 12,
    padding: 4,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  verifyIcon: {
    marginLeft: 10,
  },
  sliderIcon: {
    marginRight: 10,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedUserName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "black",
  },
  tabText: {
    fontSize: 18,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  tabContent: {
    padding: 16,
  },
  fullCircleImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  fullCircleImage: {
    width: "100%",
    height: 300,
    borderRadius: 16,
  },
  fullCircleTextContainer: {
    bottom: 180,
  },
  fullCircleText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    bottom: 50,
  },
  subText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    padding: 10,
    bottom: 20,
  },
  upgradeButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  iconButtonsContainer: {
    flexDirection: "column",
    marginTop: 16,
    bottom: 160,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  iconButtonTextContainer: {
    marginLeft: 12,
  },
  iconButtonTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButtonSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default styles;
