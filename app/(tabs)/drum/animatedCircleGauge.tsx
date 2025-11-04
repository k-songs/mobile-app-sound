import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const AnimatedCircleGauge = () => {
  const rotateValue = new Animated.Value(0);

  const animateCircle = () => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 360, // 한 바퀴를 돌도록 설정
        duration: 2000, // 2초에 한 바퀴
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'], // 360도 회전
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pointer,
          {
            transform: [
              { rotate: rotation }, // 원형 경로를 따라 pointer를 회전시킴
              { translateX: 90 }, // 원의 반지름만큼 이동
            ],
          },
        ]}
      />
      <Animated.View style={styles.center} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#f2f2f2',
    elevation: 10,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#FFD700',
    position: 'absolute',
  },
  pointer: {
    width: 10,
    height: 10,
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -5,
    borderRadius: 5,
  },
  center: {
    width: 20,
    height: 20,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    position: 'absolute',
  },
});

export default AnimatedCircleGauge;
