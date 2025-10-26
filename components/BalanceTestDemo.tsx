import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

/**
 * ⚖️ 밸런스 테스트 시뮬레이션 (실제 Web Audio API 테스트용)
 */
export const BalanceTestDemo: React.FC = () => {
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftOpacity = useSharedValue(0.5);
  const rightOpacity = useSharedValue(0.5);

  const playLeftSound = () => {
    console.log('🔊 왼쪽 채널 소리 재생 시뮬레이션');

    // 왼쪽 강조 애니메이션
    leftScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    leftOpacity.value = withTiming(1, { duration: 200 });

    // 오른쪽은 희미하게
    rightOpacity.value = withTiming(0.3, { duration: 200 });

    // 1.5초 후 원상복구
    setTimeout(() => {
      leftOpacity.value = withTiming(0.5, { duration: 300 });
      rightOpacity.value = withTiming(0.5, { duration: 300 });
    }, 1500);
  };

  const playRightSound = () => {
    console.log('🔊 오른쪽 채널 소리 재생 시뮬레이션');

    // 오른쪽 강조 애니메이션
    rightScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    rightOpacity.value = withTiming(1, { duration: 200 });

    // 왼쪽은 희미하게
    leftOpacity.value = withTiming(0.3, { duration: 200 });

    // 1.5초 후 원상복구
    setTimeout(() => {
      leftOpacity.value = withTiming(0.5, { duration: 300 });
      rightOpacity.value = withTiming(0.5, { duration: 300 });
    }, 1500);
  };

  const leftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
    opacity: leftOpacity.value,
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: rightOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚖️ 밸런스 테스트 시뮬레이션</Text>
      <Text style={styles.description}>
        헤드폰을 착용하고 좌우 소리가 나뉘어 들리는지 확인해보세요
      </Text>

      <View style={styles.balanceContainer}>
        <Animated.View style={[styles.earContainer, leftAnimatedStyle]}>
          <TouchableOpacity onPress={playLeftSound} style={styles.playButton}>
            <Text style={styles.earEmoji}>👂</Text>
            <Text style={styles.earLabel}>왼쪽</Text>
            <Text style={styles.playText}>재생</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.vsText}>VS</Text>

        <Animated.View style={[styles.earContainer, rightAnimatedStyle]}>
          <TouchableOpacity onPress={playRightSound} style={styles.playButton}>
            <Text style={styles.earEmoji}>👂</Text>
            <Text style={styles.earLabel}>오른쪽</Text>
            <Text style={styles.playText}>재생</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.instruction}>
        🎧 헤드폰을 착용하면 좌우로 소리가 나뉘어 들려야 합니다
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  earContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  playButton: {
    alignItems: 'center',
  },
  earEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  earLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  playText: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: '600',
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
    marginHorizontal: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
});
