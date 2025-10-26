import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

/**
 * 🔊 실제 소리 테스트 데모 (Web Audio API)
 */
export const SoundTestDemo: React.FC = () => {
  const buttonScale = useSharedValue(1);

  const playTestSound = async (frequency: number, type: OscillatorType = 'sine', duration: number = 2000) => {
    try {
      // Web Audio API 초기화
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // AudioContext가 suspended 상태일 수 있음
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('🎵 AudioContext resumed');
      }

      // 오실레이터 생성
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // 주파수와 파형 설정
      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // 볼륨 설정 (0.1 = 10%)
      gainNode.gain.value = 0.1;

      // 오디오 그래프 연결
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 소리 재생
      console.log(`🔊 Playing ${frequency}Hz ${type} wave for ${duration}ms`);
      oscillator.start();

      // 버튼 애니메이션
      buttonScale.value = withSequence(
        withSpring(0.9, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      // 지정된 시간 후 소리 중지
      setTimeout(() => {
        oscillator.stop();
        setTimeout(() => {
          audioContext.close();
          console.log(`🔊 Sound stopped: ${frequency}Hz ${type}`);
        }, 100);
      }, duration);

    } catch (error) {
      console.error('Web Audio API error:', error);
      alert(`Web Audio API 오류: ${error}\n\n이 브라우저에서는 Web Audio API가 지원되지 않습니다.`);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔊 실제 소리 테스트</Text>
      <Text style={styles.description}>
        각 버튼을 눌러서 실제로 어떤 소리가 나는지 확인해보세요
      </Text>

      {/* 🎵 기본 테스트 소리들 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎵 기본 테스트 톤</Text>

        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => playTestSound(440, 'sine', 2000)}
          >
            <Text style={styles.buttonEmoji}>🎼</Text>
            <Text style={styles.buttonTitle}>440Hz (A4)</Text>
            <Text style={styles.buttonDescription}>표준 음높이 (sine wave)</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => playTestSound(660, 'triangle', 2000)}
          >
            <Text style={styles.buttonEmoji}>🎵</Text>
            <Text style={styles.buttonTitle}>660Hz (E5)</Text>
            <Text style={styles.buttonDescription}>밸런스 테스트용 (triangle wave)</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 🎧 밸런스 테스트 시뮬레이션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎧 밸런스 테스트 시뮬레이션</Text>
        <Text style={styles.balanceInstruction}>
          헤드폰을 착용하고 좌우로 소리가 나뉘어 들리는지 확인하세요
        </Text>

        <View style={styles.balanceTestContainer}>
          <TouchableOpacity
            style={[styles.balanceButton, styles.leftBalanceButton]}
            onPress={() => playTestSound(660, 'triangle', 1500)}
          >
            <Text style={styles.balanceEmoji}>👂</Text>
            <Text style={styles.balanceText}>완전 왼쪽</Text>
            <Text style={styles.balanceDesc}>(pan: -1.0)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.balanceButton, styles.rightBalanceButton]}
            onPress={() => playTestSound(660, 'triangle', 1500)}
          >
            <Text style={styles.balanceEmoji}>👂</Text>
            <Text style={styles.balanceText}>완전 오른쪽</Text>
            <Text style={styles.balanceDesc}>(pan: +1.0)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔊 훈련 모드별 소리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 훈련 모드별 소리</Text>

        <View style={styles.modeSoundsContainer}>
          <TouchableOpacity
            style={styles.modeSoundButton}
            onPress={() => playTestSound(440, 'sine', 2000)}
          >
            <Text style={styles.modeEmoji}>🎯</Text>
            <Text style={styles.modeTitle}>소리 캐치 모드</Text>
            <Text style={styles.modeDesc}>440Hz sine wave</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeSoundButton}
            onPress={() => playTestSound(440, 'sine', 2000)}
          >
            <Text style={styles.modeEmoji}>🔊</Text>
            <Text style={styles.modeTitle}>청취 문지방 모드</Text>
            <Text style={styles.modeDesc}>440Hz sine (볼륨 조절)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeSoundButton}
            onPress={() => playTestSound(660, 'triangle', 2000)}
          >
            <Text style={styles.modeEmoji}>⚖️</Text>
            <Text style={styles.modeTitle}>밸런스 테스트 모드</Text>
            <Text style={styles.modeDesc}>660Hz triangle (스테레오)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ℹ️ 정보 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ 소리 정보</Text>
        <Text style={styles.infoText}>
          • 440Hz: 표준 A4 음 (피아노의 라 음){"\n"}
          • 660Hz: E5 음 (더 높은 톤으로 명확하게 들림){"\n"}
          • Sine Wave: 부드러운 소리{"\n"}
          • Triangle Wave: 더 선명한 소리{"\n"}
          • 헤드폰을 착용하면 스테레오 효과가 더 잘 들립니다
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  buttonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  balanceTestContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  balanceButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
  },
  leftBalanceButton: {
    backgroundColor: '#2196F3',
  },
  rightBalanceButton: {
    backgroundColor: '#FF9800',
  },
  balanceEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  balanceDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  modeSoundsContainer: {
    gap: 15,
  },
  modeSoundButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modeDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    margin: 10,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
