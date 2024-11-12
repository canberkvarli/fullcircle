import React from "react";
import { View, Text, StyleSheet } from "react-native";

function WelcomeTitle(): JSX.Element {
  return (
    <View style={styles.titleContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Circle</Text>
        <Text style={styles.subTitle}>It starts with a swipe</Text>
      </View>
      <View style={styles.permissionsContainer}>
        <Text style={styles.permissions}>
          By tapping “Create Account” or “Sign In,” you agree to our Terms.
          Learn how we process your data in our Privacy Policy and Cookies
          Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    //font family?
    fontWeight: "bold",
    color: "#FFFFDF",
    letterSpacing: 2,
    bottom: 50,
  },
  subTitle: {
    fontSize: 18,
    color: "#7D7D7D",
    fontStyle: "italic",
    bottom: 40,
  },
  permissionsContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 150,
  },
  permissions: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
});

export default WelcomeTitle;
