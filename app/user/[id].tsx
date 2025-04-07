import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

const UserShow: React.FC = () => {
  const { user, isFromRadiantSouls, isFromKindredSpirits } =
    useLocalSearchParams();
  const router = useRouter();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { likeMatch, getImageUrl } = useUserContext();
  const userData = JSON.parse(user as string);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      if (userData.photos && userData.photos.length > 0) {
        const urls = await Promise.all(
          userData.photos.map((photoPath: string) => {
            return getImageUrl(photoPath);
          })
        );
        const filteredUrls = urls.filter((url) => url !== null) as string[];
        setPhotoUrls(filteredUrls);
      } else {
        console.log(`No photos available for user ${userData.userId}.`);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, [user, getImageUrl]);

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
      content: userData.matchPreferences.datePreferences?.join(", ") || "N/A",
    },
    {
      title: "Children Preference",
      content: userData.childrenPreference || "N/A",
    },
    {
      title: "Education Degree",
      content: userData.educationDegree || "N/A",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="chevron-left" size={24} color="#7E7972" />
      </TouchableOpacity>

      <Text style={styles.nameText}>{userData.firstName || "Unknown"}</Text>
      <Text style={styles.nameText}>{userData.age}</Text>
      <Text style={styles.locationText}>
        {userData.location?.city || "Unknown city"},{" "}
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
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.iconWrapper}
                  onPress={handleHeartPress}
                >
                  {isFromKindredSpirits && (
                    <Icon name="heart" size={40} color="red" />
                  )}
                  {isFromRadiantSouls && (
                    <Icon name="pagelines" size={40} color="#D8BFAA" />
                  )}
                </TouchableOpacity>
              </View>

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
    width: Dimensions.get("window").width - 32,
    height: 400,
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
    padding: 10,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#D8BFAA",
  },
});

export default UserShow;
