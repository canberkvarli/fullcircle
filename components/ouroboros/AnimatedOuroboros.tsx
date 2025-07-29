import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import OuroborosSVG from './OuroborosSVG';

interface AnimatedOuroborosProps {
  size?: number;
  duration?: number;
  onComplete?: () => void;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

const AnimatedOuroboros: React.FC<AnimatedOuroborosProps> = ({
  size = 200,
  duration = 3000,
  onComplete,
  fillColor = '#F5E6D3',
  strokeColor = '#7B6B5C',
  strokeWidth = 1.5,
}) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Hinge rotation animation sequence
    Animated.sequence([
      // Main animation with parallel effects
      Animated.parallel([
        // Hinge rotation - starts fast, slows down elegantly
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 0.8, // 80% of total duration
          easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), // Back out easing for hinge effect
          useNativeDriver: true,
        }),
        // Scale up with slight bounce
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: duration * 0.6,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        // Fade in smoothly
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.5,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Settle to final scale
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration * 0.2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Brief pause before completion
      Animated.delay(200),
    ]).start(() => {
      // Animation completed, trigger callback
      onComplete?.();
    });
  }, [duration, onComplete]);

  // Interpolate rotation from -360° to 0° (hinge effect)
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-360deg', '0deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { rotate: rotateInterpolate },
          { scale: scaleAnim },
        ],
        opacity: opacityAnim,
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

export default AnimatedOuroboros;