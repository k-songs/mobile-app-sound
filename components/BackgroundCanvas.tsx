import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BackgroundCanvasProps {
  children: React.ReactNode;
}

/**
 * 선택된 테마에 따라 그래디언트 배경을 렌더링하는 컴포넌트
 * 앱 전체에 일관된 배경색을 제공합니다.
 */
export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const { colors, theme } = useTheme();
  
  console.log(`🌈 BackgroundCanvas 렌더링 - 테마: ${theme}, 색상:`, colors);
  console.log(`📐 화면 크기: width=${width}, height=${height}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors[0] }}>
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: width, 
          height: height,
          zIndex: -1
        }}
      />
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default BackgroundCanvas;

