import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface ComboCelebrationProps {
  visible: boolean;
  comboCount: number;
  onComplete?: () => void;
}

export const ComboCelebration: React.FC<ComboCelebrationProps> = ({
  visible,
  comboCount,
  onComplete
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(100);

  const getCelebrationInfo = (combo: number) => {
    if (combo >= 20) return {
      title: '🎊 LEGENDARY!',
      subtitle: '20콤보 달성!',
      color: '#FFD700',
      emoji: '👑',
      size: 120
    };
    if (combo >= 10) return {
      title: '🔥 AMAZING!',
      subtitle: '10콤보 달성!',
      color: '#FF6B6B',
      emoji: '💎',
      size: 100
    };
    if (combo >= 5) return {
      title: '✨ AWESOME!',
      subtitle: '5콤보 달성!',
      color: '#4A90E2',
      emoji: '⭐',
      size: 80
    };
    return {
      title: '🎯 PERFECT!',
      subtitle: `${combo}콤보!`,
      color: '#9B59B6',
      emoji: '🎖️',
      size: 60
    };
  };

  const celebrationInfo = getCelebrationInfo(comboCount);

  React.useEffect(() => {
    if (visible) {
      // 등장 애니메이션
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
      rotate.value = withSpring(0, { damping: 20 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });

      // 2초 후 사라지기
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withSpring(0, { damping: 15, stiffness: 100 });
        onComplete?.();
      }, 2000);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* 배경 효과 */}
      <View style={styles.backgroundEffect} />

      {/* 메인 축하 메시지 */}
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* 제목 */}
        <Text style={[styles.title, { color: celebrationInfo.color }]}>
          {celebrationInfo.title}
        </Text>

        {/* 이모지 */}
        <Text style={styles.emoji}>{celebrationInfo.emoji}</Text>

        {/* 부제목 */}
        <Text style={[styles.subtitle, { color: celebrationInfo.color }]}>
          {celebrationInfo.subtitle}
        </Text>

        {/* 콤보 수치 */}
        <View style={[styles.comboBadge, { backgroundColor: celebrationInfo.color }]}>
          <Text style={styles.comboText}>{comboCount} COMBO</Text>
        </View>

        {/* 불꽃 효과 */}
        <View style={styles.fireworkContainer}>
          <Text style={styles.firework}>🎆</Text>
          <Text style={styles.firework}>✨</Text>
          <Text style={styles.firework}>🎇</Text>
        </View>
      </Animated.View>
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
  backgroundEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    backdropFilter: 'blur(2px)',
  },
  container: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  comboBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  comboText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fireworkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  firework: {
    fontSize: 40,
  },
});
