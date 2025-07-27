// components/CustomIcon.tsx
import React from 'react';
import { Image, ImageStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// SVG imports (if using SVGs)
// import SpiritualDrawIcon from '../assets/icons/spiritual-draw.svg';
// import SoulConnectionIcon from '../assets/icons/soul-connection.svg';
// import InfiniteEnergyIcon from '../assets/icons/infinite-energy.svg';

type CustomIconNames = 
  | 'spiritual-draw' 
  | 'healing-modality'
  | 'practice-meditation'
  | 'chakra-alignment'
  // New icons for ConnectionPreferenceScreen
  | 'soul-connection'
  | 'infinite-energy'
  | 'masculine-energy'
  | 'feminine-energy'
  | 'non-binary-soul'
  | 'universal-love';

type UsedIoniconNames = 
  | 'heart' 
  | 'heart-outline' 
  | 'close' 
  | 'star' 
  | 'person'
  | 'chevron-back'
  | 'chevron-forward'
  | 'people'
  | 'infinite';

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
};

// SVG-based icons (if you choose to use SVGs instead)
const svgIconMap: Record<string, React.ComponentType<any>> = {
  // 'spiritual-draw': SpiritualDrawIcon,
  // 'soul-connection': SoulConnectionIcon,
  // 'infinite-energy': InfiniteEnergyIcon,
  // Add more SVG components here
};

const customIconNames: CustomIconNames[] = [
  'spiritual-draw',
  'healing-modality', 
  'practice-meditation',
  'chakra-alignment',
  'soul-connection',
  'infinite-energy',
  'masculine-energy',
  'feminine-energy',
  'non-binary-soul',
  'universal-love'
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