import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { PotentialMatchType } from "@/data/potentialMatches";
import potentialMatches from "@/data/potentialMatches";
import Icon from "react-native-vector-icons/FontAwesome";

const UserShow: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = (route.params || {}) as { userId: string };

  if (!userId) {
    console.log("No userId found in route params");
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text>User ID not found</Text>
      </ScrollView>
    );
  }

  console.log("Received userId:", userId);

  const userData: PotentialMatchType | undefined = potentialMatches.find(
    (match) => match.userId === userId
  );

  if (!userData) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text>User not found</Text>
      </ScrollView>
    );
  }

  console.log("User data found:", userData);

  const details = [
    { title: "Gender", content: userData.gender || "N/A" },
    { title: "Height", content: userData.height || "N/A" },
    {
      title: "Ethnicities",
      content: userData.ethnicities?.join(", ") || "N/A",
    },
    {
      title: "Sexual Orientation",
      content: userData.sexualOrientation?.join(", ") || "N/A",
    },
    {
      title: "Date Preferences",
      content: userData.datePreferences?.join(", ") || "N/A",
    },
    {
      title: "Children Preference",
      content: userData.childrenPreference || "N/A",
    },
    { title: "Education Degree", content: userData.educationDegree || "N/A" },
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.nameText}>
        {userData.firstName} {userData.lastName}
      </Text>
      <Text style={styles.locationText}>
        {userData.location?.city || "Unknown city"},{" "}
        {userData.location?.country || "Unknown country"}
      </Text>

      {/* Alternating Photos and Information */}
      <View style={styles.contentContainer}>
        {userData.photos && userData.photos.length > 0 ? (
          userData.photos.map((photo, index) => (
            <React.Fragment key={index}>
              {/* Photo */}
              <View style={styles.photoCard}>
                <Image source={{ uri: photo }} style={styles.photo} />
              </View>
              {/* Information (only if it exists) */}
              {details[index] && (
                <DetailCard
                  title={details[index].title}
                  content={details[index].content}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <Text style={styles.noPhotosText}>No photos available</Text>
        )}
      </View>
    </ScrollView>
  );
};

// Card component to display title and content in a bordered container
const DetailCard: React.FC<{ title: string; content: string }> = ({
  title,
  content,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}:</Text>
      <Text style={styles.cardContent}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 25,
    backgroundColor: "white",
  },
  backButton: {
    marginBottom: 20,
    marginLeft: 10,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  locationText: {
    fontSize: 18,
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 20,
  },
  photoCard: {
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: 350,
    height: 350,
    borderRadius: 10,
  },
  noPhotosText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
    textAlign: "center",
  },
  detailsContainer: {
    marginTop: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContent: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
});

export default UserShow;
