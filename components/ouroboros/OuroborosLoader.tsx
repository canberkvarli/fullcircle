// components/OuroborosLoader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import OuroborosSVG from './OuroborosSVG';

export type LoaderVariant = 'landing' | 'spinner' | 'pulse' | 'breathe';

interface OuroborosLoaderProps {
  size?: number;
  onComplete?: () => void;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  duration?: number;
  loop?: boolean; // Enable continuous looping
  variant?: LoaderVariant; // Different animation styles
}

const OuroborosLoader: React.FC<OuroborosLoaderProps> = ({
  size = 200,
  onComplete,
  fillColor = '#F5E6D3',
  strokeColor = '#7B6B5C',
  strokeWidth = 1.5,
  duration = 3000,
  loop = false, // Default: one-time animation
  variant = 'landing',
}) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const createAnimation = () => {
      // Reset values
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);

      switch (variant) {
        case 'landing':
          // Hinge-style speed burst for landing pages
          const hingeEasing = (t: number) => {
            if (t < 0.25) {
              return 0.3 * t;
            } else if (t < 0.65) {
              const localT = (t - 0.25) / 0.4;
              return 0.075 + 0.65 * localT * localT * localT;
            } else {
              const localT = (t - 0.65) / 0.35;
              return 0.725 + 0.275 * (2 * localT - localT * localT);
            }
          };

          return Animated.parallel([
            Animated.timing(rotateAnim, {
              toValue: 4,
              duration: duration,
              easing: hingeEasing,
              useNativeDriver: true,
            }),
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
              { iterations: loop ? -1 : Math.ceil(duration / (duration * 0.66)) }
            ),
          ]);

        case 'spinner':
          // Simple continuous rotation for activity indicators
          return Animated.parallel([
            Animated.timing(rotateAnim, {
              toValue: duration / 1000, // 1 rotation per second
              duration: duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(scaleAnim, {
                  toValue: 1.02,
                  duration: 800,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1,
                  duration: 800,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ]),
              { iterations: loop ? -1 : 1 }
            ),
          ]);

        case 'pulse':
          // Pulsing effect for data loading
          return Animated.parallel([
            Animated.timing(rotateAnim, {
              toValue: duration / 2000, // Slower rotation
              duration: duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(scaleAnim, {
                  toValue: 1.1,
                  duration: 600,
                  easing: Easing.inOut(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1,
                  duration: 600,
                  easing: Easing.inOut(Easing.quad),
                  useNativeDriver: true,
                }),
              ]),
              { iterations: loop ? -1 : Math.ceil(duration / 1200) }
            ),
          ]);

        case 'breathe':
          // Slow, meditative breathing for spiritual contexts
          return Animated.parallel([
            Animated.timing(rotateAnim, {
              toValue: duration / 4000, // Very slow rotation
              duration: duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(scaleAnim, {
                  toValue: 1.06,
                  duration: 1500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1,
                  duration: 1500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ]),
              { iterations: loop ? -1 : Math.ceil(duration / 3000) }
            ),
          ]);

        default:
          return Animated.timing(rotateAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          });
      }
    };

    const startAnimation = () => {
      const animation = createAnimation();
      
      if (loop) {
        // For looping animations - create a simple continuous rotation
        const continuousRotation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        
        // Separate scale animation for pulsing
        const continuousScale = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: variant === 'pulse' ? 1.1 : 1.03,
              duration: variant === 'pulse' ? 600 : 800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: variant === 'pulse' ? 600 : 800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
        
        // Start both animations in parallel
        animationRef.current = Animated.parallel([
          continuousRotation,
          continuousScale
        ]);
        animationRef.current.start();
      } else {
        // For one-time animations
        animation.start(() => {
          onComplete?.();
        });
      }
    };

    startAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [duration, onComplete, loop, variant]);

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