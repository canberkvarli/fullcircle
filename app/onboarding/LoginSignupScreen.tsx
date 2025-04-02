import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import styles from "@/styles/Onboarding/LoginSignupScreenStyles";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import WelcomeTitle from "../../components/WelcomeTitle";
import SSOButtons from "../../components/SSOButtons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const videoSource = require("../../assets/videos/danielle.mov");

function LoginSignupScreen(): JSX.Element {
  const router = useRouter();
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [showSSOButtons, setShowSSOButtons] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (video.current) {
      (video.current as Video).playAsync();
    }
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleSignIn = () => {
    setShowSSOButtons(true);
  };

  const handleGoBack = () => {
    setShowSSOButtons(false);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.backgroundVideo}
        source={videoSource}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        onLoad={handleVideoLoad}
      />
      {!videoLoaded && (
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.loadingIndicator}
        />
      )}
      {videoLoaded && (
        <View style={styles.overlay}>
          {showSSOButtons && (
            <TouchableOpacity style={styles.backIcon} onPress={handleGoBack}>
              <FontAwesome name="chevron-left" size={24} color="white" />
            </TouchableOpacity>
          )}
          <Image
            source={require("../../assets/circle.svg")}
            style={styles.logo}
          />
          <WelcomeTitle />
          <Text style={styles.affirmation}>
            <Text style={{ fontStyle: "italic" }}>
              Embark on a journey of love and self-discovery.
            </Text>
          </Text>
          <Text style={styles.infoText}>
            By signing up for Circle, you agree to our{" "}
            <Text style={styles.link} onPress={() => console.log("pressed")}>
              Terms of Service
            </Text>
            . Learn how we process your data in our{" "}
            <Text style={styles.link} onPress={() => console.log("pressed")}>
              Privacy Policy
            </Text>
            , and{" "}
            <Text style={styles.link} onPress={() => console.log("pressed")}>
              Cookies Policy
            </Text>
            .
          </Text>
          {showSSOButtons ? (
            <SSOButtons />
          ) : (
            <View>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() =>
                  router.replace("onboarding/PhoneNumberScreen" as any)
                }
              >
                <Text style={styles.buttonText}>Create account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSignIn}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default LoginSignupScreen;
