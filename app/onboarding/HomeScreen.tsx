import React from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";
import { Box } from "native-base";

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Box>Hello world</Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
  },
});

export default HomeScreen;
