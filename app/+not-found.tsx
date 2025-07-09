import { Link, Stack } from "expo-router";
import { View, StyleSheet, Text } from "react-native";

export default function NotFoundScreen() {
  console.log("🚨 NOT FOUND SCREEN SHOWN - This shouldn't happen during normal flow");
  
  return (
    <>
      <Stack.Screen options={{ title: "Navigation Error" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Navigation Error</Text>
        <Text style={styles.subtitle}>Something went wrong with navigation</Text>
        <Link href="/onboarding/LoginSignupScreen">Go to Login</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
});