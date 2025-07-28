// components/CustomIcon.tsx
import React from 'react';
import { Image, ImageStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CustomIconNames = 
  | 'temple'
  | 'ohm'
  | 'yoga'
  | 'pigeon'
  | 'friendship'
  | 'meditation'
  | 'prayer'
  | 'journal'
  | 'energy-healing'
  | 'crystal'
  | 'tarot'
  | 'aries'
  | 'hiking'
  | 'gong'
  | 'breathwork'
  | 'dance'
  | 'leaf'
  | 'shaman'
  | 'martial-arts'
  | 'fasting'
  | 'lotus'
  | 'healing-journey'
  | 'yinyang'
  | 'acupuncture'
  | 'sound'
  | 'aroma'
  | 'light'
  | 'massage'
  | 'therapy'
  | 'homeopathy'
  | 'plant'
  | 'mushroom'

type UsedIoniconNames = 
  | 'heart' 
  | 'heart-outline' 
  | 'close' 
  | 'star' 
  | 'person'
  | 'chevron-back'
  | 'chevron-forward'
  | 'people'
  | 'infinite'

type IconProps = {
  name: CustomIconNames | UsedIoniconNames | string;
  size?: number;
  color?: string;
  style?: Pick<ImageStyle & TextStyle, 'margin' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight' | 'opacity' | 'transform'>;
};

// PNG/Image-based icons
const iconMap: Record<string, any> = {
  "temple": require('../assets/icons/temple.png'),
  "ohm": require('../assets/icons/ohm.png'),
  "yoga": require('../assets/icons/yoga.png'),
  "pigeon": require('../assets/icons/pigeon.png'),
  "friendship": require('../assets/icons/friendship.png'),
  "meditation": require('../assets/icons/meditation.png'),
  "prayer": require('../assets/icons/prayer.png'),
  "journal": require('../assets/icons/journal.png'),
  "aries": require('../assets/icons/aries.png'),
  "energy-healing": require('../assets/icons/energy-healing.png'),
  "crystal": require('../assets/icons/crystal.png'),
  "dance": require('../assets/icons/dance.png'),
  "fasting": require('../assets/icons/fasting.png'),
  "hiking": require('../assets/icons/hiking.png'),
  "tarot": require('../assets/icons/tarot.png'),
  "shaman": require('../assets/icons/shaman.png'),
  'martial-arts': require('../assets/icons/martial-arts.png'),
  'breathwork': require('../assets/icons/breathwork.png'),
  'gong': require('../assets/icons/gong.png'),
  'leaf': require('../assets/icons/leaf.png'),
  'lotus': require('../assets/icons/lotus.png'),
  'healing-journey': require('../assets/icons/healing-journey.png'),
  'yinyang': require('../assets/icons/yinyang.png'),
  'acupuncture': require('../assets/icons/acupuncture.png'),
  'sound': require('../assets/icons/sound.png'),
  'aroma': require('../assets/icons/aroma.png'),
  'light': require('../assets/icons/light.png'),
  'massage': require('../assets/icons/massage.png'),
  'therapy': require('../assets/icons/therapy.png'),
  'homeopathy': require('../assets/icons/homeopathy.png'),
  'plant': require('../assets/icons/plant.png'),
  'mushroom': require('../assets/icons/mushroom.png'),
};

// SVG-based icons (if you choose to use SVGs instead)
const svgIconMap: Record<string, React.ComponentType<any>> = {
  // 'spiritual-draw': SpiritualDrawIcon,
  // 'soul-connection': SoulConnectionIcon,
  // 'infinite-energy': InfiniteEnergyIcon,
  // Add more SVG components here
};

// FIXED: Include all the icons you have in iconMap
const customIconNames: CustomIconNames[] = [
  'temple',
  'ohm', 
  'yoga',
  'pigeon',
  'friendship',
  'meditation',
  'prayer',
  'journal',
  'energy-healing',
  'crystal',
  'tarot',
  'aries',
  'hiking',
  'gong',
  'breathwork',
  'dance',
  'leaf',
  'shaman',
  'martial-arts',
  'fasting',
  'lotus',
  'healing-journey',
  'yinyang',
  'acupuncture',
  'sound',
  'aroma',
  'light',
  'massage',
  'therapy',
  'homeopathy',
  'plant',
  'mushroom'
];

export const CustomIcon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color, 
  style 
}) => {
  const commonStyle = {
    ...style,
  };

  // Check if it's a custom icon
  if (customIconNames.includes(name as CustomIconNames)) {
    
    // Option 1: If using SVGs
    const SvgIcon = svgIconMap[name];
    if (SvgIcon) {
      return (
        <SvgIcon 
          width={size} 
          height={size} 
          fill={color}
          style={commonStyle}
        />
      );
    }
    
    // Option 2: If using PNGs (fallback)
    const imageSource = iconMap[name];
    if (imageSource) {
      return (
        <Image 
          source={imageSource}
          style={[
            { 
              width: size, 
              height: size,
              ...(color && { tintColor: color })
            },
            commonStyle
          ]}
          resizeMode="contain"
        />
      );
    }
  }
  
  // Fallback to Ionicons
  return (
    <Ionicons 
      name={name as UsedIoniconNames} 
      size={size} 
      color={color} 
      style={commonStyle}
    />
  );
};

// Export the type for use in other components
export type { CustomIconNames, UsedIoniconNames };