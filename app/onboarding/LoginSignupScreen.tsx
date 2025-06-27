import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useColorScheme,
  Animated,
} from "react-native";
import createStyles from "@/styles/Onboarding/LoginSignupScreenStyles";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import SSOButtons from "@/components/SSOButtons";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const videoSource = require("../../assets/videos/danielle.mp4");

function LoginSignupScreen(): JSX.Element {
  const router = useRouter();
  const video = useRef(null);
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);
  const colors = Colors[colorScheme];
  
  const [status, setStatus] = useState({});
  const [showSSOButtons, setShowSSOButtons] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (video.current) {
      (video.current as Video).playAsync();
    }
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleSignIn = () => {
    // Fade out initial buttons and slide in SSO buttons
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSSOButtons(true);
      // Fade in SSO buttons
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleGoBack = () => {
    // Fade out SSO buttons and slide back
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSSOButtons(false);
      // Fade in initial buttons
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
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
          color={colors.primary}
          style={styles.loadingIndicator}
        />
      )}
      {videoLoaded && (
        <View style={styles.overlay}>
          {showSSOButtons && (
            <TouchableOpacity style={styles.backIcon} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          {/* Logo */}
          <Image
            source={require("../../assets/circle.svg")}
            style={styles.logo}
          />
          
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>CIRCLE</Text>
            <Text style={styles.subTitle}>Where intention meets connection</Text>
          </View>
          
          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Embark on a journey of love and self-discovery
          </Text>
          
          {/* Buttons Section */}
          <Animated.View 
            style={[
              styles.buttonSection,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, showSSOButtons ? 0 : -20],
                  }),
                }],
              }
            ]}
          >
            {showSSOButtons ? (
              <SSOButtons />
            ) : (
              <View style={styles.buttonContainer}>
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
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          
          {/* Terms and Conditions - Enhanced visibility */}
          <View style={[styles.termsContainer, styles.enhancedTermsContainer]}>
            <Text style={[styles.infoText, styles.enhancedInfoText]}>
              By signing up for Circle, you agree to our{" "}
              <Text style={[styles.link, styles.enhancedLink]} onPress={() => console.log("pressed")}>
                Terms of Service
              </Text>
              . Learn how we process your data in our{" "}
              <Text style={[styles.link, styles.enhancedLink]} onPress={() => console.log("pressed")}>
                Privacy Policy
              </Text>
              {" "}and{" "}
              <Text style={[styles.link, styles.enhancedLink]} onPress={() => console.log("pressed")}>
                Cookies Policy
              </Text>
              .
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}


export default LoginSignupScreen;