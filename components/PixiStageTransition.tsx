import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing
} from 'react-native-reanimated';

/**
 * 🎭 PixiJS 스타일 스테이지 전환 애니메이션
 *
 * PixiJS 개념을 react-native-reanimated로 구현:
 * - Container: View로 대체
 * - Graphics: Animated.View로 대체
 * - Sprite: Text나 Image로 대체
 * - Particle System: 다수의 Animated.View로 구현
 */

interface PixiStageTransitionProps {
  visible: boolean;
  stageFrom: number;
  stageTo: number;
  onComplete?: () => void;
}

export const PixiStageTransition: React.FC<PixiStageTransitionProps> = ({
  visible,
  stageFrom,
  stageTo,
  onComplete
}) => {
  // 🎭 PixiJS 스타일 상태 관리
  const backgroundOpacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(100);

  // ✨ 파티클 시스템 (PixiJS ParticleContainer 개념)
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
    translateX: useSharedValue(0),
    translateY: useSharedValue(0),
    rotation: useSharedValue(0),
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const mainContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value }
    ],
  }));

  // 🌟 파티클 애니메이션 (각각 다른 타이밍과 방향)
  const particleStyles = particles.map((particle, index) => {
    const angle = (360 / 20) * index;
    const distance = 100 + Math.random() * 50;
    const delay = Math.random() * 300;

    return useAnimatedStyle(() => ({
      transform: [
        { translateX: particle.translateX.value },
        { translateY: particle.translateY.value },
        { scale: particle.scale.value },
        { rotate: `${particle.rotation.value}deg` }
      ],
      opacity: particle.opacity.value,
    }));
  });

  useEffect(() => {
    if (visible) {
      // 🎬 PixiJS 스타일 애니메이션 시퀀스
      backgroundOpacity.value = withTiming(1, { duration: 300 });

      // 메인 컨테이너 애니메이션 (등장 효과)
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      rotation.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });

      // 🌟 파티클 시스템 활성화 (PixiJS ParticleContainer처럼)
      particles.forEach((particle, index) => {
        const angle = (360 / 20) * index;
        const distance = 100 + Math.random() * 50;

        // 초기화
        particle.scale.value = 0;
        particle.opacity.value = 0;
        particle.translateX.value = 0;
        particle.translateY.value = 0;
        particle.rotation.value = 0;

        // 폭발 애니메이션
        particle.translateX.value = withTiming(
          Math.cos((angle * Math.PI) / 180) * distance,
          { duration: 800, easing: Easing.out(Easing.cubic) }
        );

        particle.translateY.value = withTiming(
          Math.sin((angle * Math.PI) / 180) * distance,
          { duration: 800, easing: Easing.out(Easing.cubic) }
        );

        particle.scale.value = withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.cubic)
        });

        particle.opacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 600 })
        );

        particle.rotation.value = withTiming(360 * 2, {
          duration: 1000,
          easing: Easing.linear
        });
      });

      // 🎭 스테이지 전환 완료 후 정리
      setTimeout(() => {
        backgroundOpacity.value = withTiming(0, { duration: 500 });
        onComplete?.();
      }, 2000);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* 🎨 배경 오버레이 (PixiJS Graphics 개념) */}
      <Animated.View style={[styles.background, backgroundStyle]} />

      {/* 🎭 메인 전환 효과 (PixiJS Container 개념) */}
      <Animated.View style={[styles.mainContainer, mainContainerStyle]}>
        <View style={styles.stageInfo}>
          <Text style={styles.stageFrom}>Stage {stageFrom}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.stageTo}>Stage {stageTo}</Text>
        </View>

        <Text style={styles.transitionText}>🎊 축하합니다!</Text>
        <Text style={styles.subText}>새로운 도전에 도전하세요!</Text>
      </Animated.View>

      {/* 🌟 파티클 시스템 (PixiJS ParticleContainer 개념) */}
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: ['#FFD700', '#FF6B6B', '#4A90E2', '#9B59B6', '#E67E22'][index % 5]
            },
            particleStyles[index]
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  mainContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stageFrom: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 15,
    color: '#4A90E2',
  },
  stageTo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  transitionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    elevation: 5,
  },
});
