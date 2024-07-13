import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import WelcomeTitle from "../../components/WelcomeTitle";
import SSOButtons from "../../components/SSOButtons";

const videoSource = require("../../assets/videos/ecstatic.mp4");

function LoginSignupScreen(): JSX.Element {
  const router = useRouter();
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [showSSOButtons, setShowSSOButtons] = useState(false);

  useEffect(() => {
    if (video.current) {
      (video.current as Video).playAsync();
    }
  }, []);

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
      />
      <View style={styles.overlay}>
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
          <>
            <SSOButtons />
            <Button title="Back" onPress={handleGoBack} />
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.replace("onboarding/PhoneNumberScreen")}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay to make text more readable
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  affirmation: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
  },
  link: {
    color: "#add8e6",
    textDecorationLine: "underline",
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#4caf50",
    width: 150,
  },
  secondaryButton: {
    backgroundColor: "#8a2be2",
    width: 150,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default LoginSignupScreen;
