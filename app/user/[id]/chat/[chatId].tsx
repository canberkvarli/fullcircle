import React from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const Chat = () => {
  const route = useRoute();
  const { chatId } = route.params as { chatId: string };
  console.log("Chat ID:", chatId); // Check if chatId is correctly passed

  return (
    <View style={styles.container}>
      {/* <Text style={styles.chatTitle}>Chat with {userId}</Text> */}
      {/* Display messages here */}
      <View style={styles.messageContainer}>
        <Text>No messages yet!</Text>
      </View>
      {/* Input area */}
      <TextInput placeholder="Type your message..." style={styles.input} />
      <Button
        title="Send"
        onPress={() => {
          /* handle sending message */
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  chatTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  messageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default Chat;
