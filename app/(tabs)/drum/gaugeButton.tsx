import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { Easing, withTiming } from 'react-native-reanimated';

const GaugeButton = () => {
  const [animationValue, setAnimationValue] = useState(0);

  // 애니메이션을 통해 stroke-dashoffset 값을 변화시켜 경로를 그리는 효과를 줍니다.
  const animateGauge = () => {
    setAnimationValue(animationValue === 0 ? 1 : 0); // 클릭 시 애니메이션 시작
  };

  // 애니메이션 값으로 stroke-dashoffset을 계산
  const dashOffset = withTiming(animationValue ? 0 : 565, {
    duration: 1000, // 애니메이션 지속시간
    easing: Easing.linear, // 선형 애니메이션
  });

  return (
    <TouchableOpacity onPress={animateGauge}>
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>CLICK ME</Text>
        <Svg width="200" height="200" viewBox="0 0 200 200">
          <Circle
            cx="100"
            cy="100"
            r="90"
            stroke="#FFD700"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray="565" // 원의 둘레 (2 * PI * 반지름)
            strokeDashoffset={dashOffset} // 애니메이션으로 변화할 값
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#333',
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GaugeButton;
