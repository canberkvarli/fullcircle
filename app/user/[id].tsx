import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { ActivityIndicator } from "react-native";

const UserShow: React.FC = () => {
  const { user, source } = useLocalSearchParams();
  const router = useRouter();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const { likeMatch, getImageUrl } = useUserContext();

  useEffect(() => {
    const fetchPhotos = async () => {
      const userData = JSON.parse(user as string);

      if (userData.photos && userData.photos.length > 0) {
        const urls = await Promise.all(
          userData.photos.map(async (photoPath: string) => {
            return await getImageUrl(photoPath);
          })
        );
        setPhotoUrls(urls.filter((url) => url !== null));
      }
      setLoading(false);
    };

    fetchPhotos();
  }, [user]);

  const userData = JSON.parse(user as string);

  const shouldShowHeart = source === "KindredSpirits";
  const shouldShowRose = source === "RadiantSouls";

  const handleHeartPress = () => {
    likeMatch(userData.userId);
  };

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
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="chevron-left" size={24} color="#7E7972" />
      </TouchableOpacity>

      <Text style={styles.nameText}>{userData.firstName || "Unknown"}</Text>
      <Text style={styles.locationText}>
        {userData.location?.city || "Unknown city"},
        {userData.location?.country || "Unknown country"}
      </Text>

      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#D8BFAA" />
        ) : photoUrls.length > 0 ? (
          photoUrls.map((photo, index) => (
            <View key={index} style={styles.cardWrapper}>
              <View>
                <Image
                  source={{ uri: photo }}
                  style={styles.photo}
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      photo,
                      e.nativeEvent.error
                    );
                    console.error("Full error response:", e.nativeEvent);
                  }}
                />
                <TouchableOpacity
                  style={styles.iconWrapper}
                  onPress={handleHeartPress}
                >
                  {shouldShowHeart && (
                    <Icon name="heart" size={30} color="red" />
                  )}
                  {shouldShowRose && (
                    <Icon name="pagelines" size={30} color="#D8BFAA" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Information */}
              {index < details.length && (
                <View style={styles.detailsContainer}>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                      {details[index].title}:
                    </Text>
                    <Text style={styles.cardContent}>
                      {details[index].content}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No photos available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 16,
    backgroundColor: "#EDE9E3",
  },
  backButton: {
    marginBottom: 16,
    marginLeft: 10,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#7E7972",
  },
  locationText: {
    fontSize: 16,
    textAlign: "center",
    color: "#7E7972",
    marginBottom: 16,
  },
  contentContainer: {
    marginTop: 20,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  photo: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
    borderRadius: 20,
  },
  detailsContainer: {
    marginTop: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
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
  iconWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 5,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#D8BFAA",
  },
});

export default UserShow;
