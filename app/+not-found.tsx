import { Link, Stack } from "expo-router";
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  useColorScheme,
  Animated,
  Dimensions,
  Platform 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';

const { width: screenWidth } = Dimensions.get('window');

// Spiritual color palette based on your app
const Colors = {
  light: {
    background: '#F7F4F0', // Warm off-white
    primary: '#8B5A2B', // Earth brown
    secondary: '#D4AF37', // Golden
    textDark: '#3C2F2F', // Dark brown
    textLight: '#6B5B73', // Muted purple
    textMuted: '#9B8B7A', // Light brown
    card: '#FFFFFF',
    border: '#E8DDD4', // Light beige
    accent: '#FFD700', // Bright gold
  },
  dark: {
    background: '#1A1611', // Dark earth
    primary: '#D4AF37', // Golden (inverted)
    secondary: '#8B5A2B', // Earth brown
    textDark: '#F0E6D6', // Light cream
    textLight: '#C4B5A0', // Warm grey
    textMuted: '#8B7355', // Muted brown
    card: '#2D2419',
    border: '#3D3426',
    accent: '#FFD700', // Bright gold
  },
};

export default function NotFoundScreen() {
  console.log("🚨 NOT FOUND SCREEN SHOWN - This shouldn't happen during normal flow");
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle rotation animation for the icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <Stack.Screen options={{ 
        title: "Path Not Found",
        headerShown: false 
      }} />
      
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Animated Background Elements */}
        <View style={styles.backgroundElements}>
          <Animated.View 
            style={[
              styles.floatingOrb, 
              {
                width: 120,
                height: 120,
                top: '15%',
                right: '10%',
                backgroundColor: colors.accent,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1]
                }),
                transform: [{ rotate: rotation }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingOrb, 
              {
                width: 80,
                height: 80,
                bottom: '25%',
                left: '15%',
                backgroundColor: colors.primary,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.15]
                })
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingOrb, 
              {
                width: 60,
                height: 60,
                top: '45%',
                left: '5%',
                backgroundColor: colors.secondary,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1]
                })
              }
            ]} 
          />
        </View>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Sacred Symbol */}
          <View style={styles.symbolContainer}>
            <Animated.View 
              style={[
                styles.outerCircle,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.accent + '40',
                  transform: [{ rotate: rotation }]
                }
              ]}
            >
              <View style={[styles.innerCircle, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons 
                  name="compass-outline" 
                  size={48} 
                  color={colors.accent} 
                />
              </View>
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textDark }]}>Path Not Found</Text>
          
          {/* Spiritual Message */}
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Sometimes we wander off the intended path.{'\n'}
            Let's gently guide you back to your journey.
          </Text>

          {/* Affirmation */}
          <Text style={[styles.affirmation, { color: colors.textMuted }]}>
            Every{' '}
            <Text style={[styles.highlightedWord, { color: colors.textDark }]}>detour</Text>
            {' '}is an opportunity to discover something new about yourself.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Link href="/onboarding/LoginSignupScreen" asChild>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="home-outline" size={20} color={colors.background} />
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>Return Home</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/(tabs)/Connect" asChild>
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]}>
                <Ionicons name="heart-outline" size={20} color={colors.primary} />
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Find Connections</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Help Text */}
          <Text style={[styles.helpText, { color: colors.textMuted }]}>
            If this keeps happening, please reach out to our support team.
          </Text>
        </Animated.View>

        {/* Bottom Decoration */}
        <Animated.View 
          style={[
            styles.bottomDecoration,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={[styles.decorationText, { color: colors.accent }]}>✧ ∘ ◦ ∘ ✧</Text>
        </Animated.View>
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
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
    maxWidth: screenWidth * 0.9,
  },
  symbolContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 27,
    fontStyle: 'italic',
  },
  affirmation: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 25,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  highlightedWord: {
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: 'italic',
    opacity: 0.8,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  decorationText: {
    fontSize: 18,
    letterSpacing: 4,
    opacity: 0.6,
  },
});