import React, { useState } from "react";
import { Button, Text, TextInput, Alert } from "react-native";
import styles from "@/styles/Onboarding/LoginScreenStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

function LoginScreen(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const signIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      Alert.alert("check your emails!");
    } catch (error) {
      console.log(error);
      Alert.alert(`Something went wrong ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={signIn} />
      <Button
        title="Go back"
        onPress={() => router.navigate("onboarding/LoginSignupScreen" as any)}
      />
    </SafeAreaView>
  );
}

export default LoginScreen;
