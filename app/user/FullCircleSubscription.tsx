import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";

export default function FullCircleSubscription() {
  const router = useRouter();

  // Handle navigation to upgrade or payment methods (you can replace this with the actual route when ready)
  const handleUpgrade = () => {
    console.log("Redirecting to payment methods...");
    // Navigation to Stripe or payment method screen (placeholder)
    // router.push("/user/upgradePaymentMethod");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FullCircle Subscription</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="close" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.mainTitle}>What is FullCircle?</Text>
        <Text style={styles.description}>
          FullCircle is our premium subscription that unlocks a range of
          enhanced features to help you connect deeper with like-minded
          spiritual beings. As a FullCircle member, you will have access to
          exclusive features such as:
        </Text>

        <View style={styles.benefitsList}>
          <Text style={styles.benefit}>- Advanced matching preferences</Text>
          <Text style={styles.benefit}>
            - Exclusive spiritual community access
          </Text>
          <Text style={styles.benefit}>- Enhanced profile customization</Text>
          <Text style={styles.benefit}>- Priority support and more!</Text>
        </View>

        <Text style={styles.mainTitle}>Why Upgrade?</Text>
        <Text style={styles.description}>
          Unlock your potential to create deeper, more meaningful connections
          with others. FullCircle offers tailored preferences and more ways to
          be seen and heard in the community.
        </Text>

        <View style={styles.subscribeContainer}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.subscribeText}>Upgrade Now</Text>
          </TouchableOpacity>
          <Text style={styles.subscribeDescription}>
            Experience the full potential of your connections and grow within
            the community.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  scrollView: {
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "black",
  },
  description: {
    fontSize: 16,
    color: "#4A4A4A",
    marginBottom: 15,
  },
  benefitsList: {
    marginLeft: 15,
    marginBottom: 15,
  },
  benefit: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  subscribeContainer: {
    backgroundColor: "#F9E3F8",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 20,
  },
  subscribeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "purple",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "purple",
    marginRight: 10,
  },
  subscribeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  subscribeDescription: {
    color: "black",
    fontSize: 14,
    maxWidth: "70%",
  },
});
