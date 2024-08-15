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
          By tapping “create account” or “Sign in” you agree to our Terms. Learn
          how we process your data in our Privacy Policy and Cookies Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 2,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  permissionsContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 50,
  },
  permissions: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
});

export default WelcomeTitle;
