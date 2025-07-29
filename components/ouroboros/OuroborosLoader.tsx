// components/OuroborosLoader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import OuroborosSVG from './OuroborosSVG';

interface OuroborosLoaderProps {
  size?: number;
  onComplete?: () => void;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  duration?: number; // Total duration before calling onComplete
}

const OuroborosLoader: React.FC<OuroborosLoaderProps> = ({
  size = 200,
  onComplete,
  fillColor = '#F5E6D3',
  strokeColor = '#7B6B5C',
  strokeWidth = 1.5,
  duration = 3000, // Default 3 seconds like your Lottie
}) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // Start at normal size

  useEffect(() => {
    // Create ultra-smooth animation with custom easing
    const createAnimation = () => {
      // Reset values
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);

      // Custom easing function for Hinge-style speed burst
      const hingeEasing = (t: number) => {
        // Create speed burst in the middle with immediate start
        if (t < 0.25) {
          // Immediate responsive start - not too slow
          return 0.3 * t;
        } else if (t < 0.65) {
          // FAST middle section (speed burst)
          const localT = (t - 0.25) / 0.4;
          return 0.075 + 0.65 * localT * localT * localT; // Cubic for extra speed
        } else {
          // Smooth finish
          const localT = (t - 0.65) / 0.35;
          return 0.725 + 0.275 * (2 * localT - localT * localT);
        }
      };

      return Animated.parallel([
        // Single ultra-smooth rotation - no phases, no stops
        Animated.timing(rotateAnim, {
          toValue: 4, // 4 full rotations total
          duration: duration,
          easing: hingeEasing, // Custom smooth curve with speed burst
          useNativeDriver: true,
        }),
        
        // Gentle continuous breathing
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.03,
              duration: duration * 0.33,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: duration * 0.33,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          { iterations: Math.ceil(duration / (duration * 0.66)) }
        ),
      ]);
    };

    const animation = createAnimation();
    animation.start(() => {
      // Animation completed naturally, navigate
      onComplete?.();
    });

    return () => {
      animation.stop();
    };
  }, [duration, onComplete]);

  // Interpolations
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { rotate: rotateInterpolate },
          { scale: scaleAnim },
        ],
      }}
    >
      <OuroborosSVG
        size={size}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
      />
    </Animated.View>
  );
};

export default OuroborosLoader;