import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

const FullCircleUpgrade: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock FullCircle</Text>
      <Text style={styles.message}>
        Experience the best of Circle with FullCircle. Get access to all
        features, including seeing who liked you.
      </Text>
      <Button
        title="Upgrade to FullCircle"
        onPress={() => console.log("Upgrade to FullCircle")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default FullCircleUpgrade;
