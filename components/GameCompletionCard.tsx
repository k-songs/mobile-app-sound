import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface GameCompletionCardProps {
  visible: boolean;
  score: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  maxCombo: number;
  accuracy: number;
  onContinue?: () => void;
  onFinish?: () => void;
}

export const GameCompletionCard: React.FC<GameCompletionCardProps> = ({
  visible,
  score,
  perfectCount,
  goodCount,
  missCount,
  maxCombo,
  accuracy,
  onContinue,
  onFinish
}) => {
  // 🎮 게임 스타일 애니메이션
  const cardScale = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const bounceAnimation = useSharedValue(1);

  // 등급 계산
  const getGradeInfo = () => {
    if (accuracy >= 95) return { grade: 'S', color: '#FFD700', emoji: '🏆' };
    if (accuracy >= 85) return { grade: 'A', color: '#FF6B6B', emoji: '🥇' };
    if (accuracy >= 75) return { grade: 'B', color: '#4A90E2', emoji: '🥈' };
    if (accuracy >= 60) return { grade: 'C', color: '#9B59B6', emoji: '🥉' };
    return { grade: 'D', color: '#666', emoji: '🎯' };
  };

  const gradeInfo = getGradeInfo();

  React.useEffect(() => {
    if (visible) {
      // 카드 등장 애니메이션
      cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      cardOpacity.value = withTiming(1, { duration: 300 });

      // 바운스 애니메이션
      bounceAnimation.value = withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    }
  }, [visible]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value * bounceAnimation.value }
    ],
    opacity: cardOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* 배경 오버레이 */}
      <View style={styles.background} />

      {/* 메인 완료 카드 */}
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        {/* 제목 */}
        <View style={styles.header}>
          <Text style={styles.title}>🎉 학습 완료!</Text>
          <Text style={styles.subtitle}>오늘도 훌륭한 성과를 달성했습니다!</Text>
        </View>

        {/* 등급 표시 */}
        <View style={styles.gradeSection}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeInfo.color }]}>
            <Text style={styles.gradeEmoji}>{gradeInfo.emoji}</Text>
            <Text style={styles.gradeText}>{gradeInfo.grade}등급</Text>
          </View>
          <Text style={styles.accuracyText}>{accuracy.toFixed(1)}% 정확도</Text>
        </View>

        {/* 통계 */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{score.toLocaleString()}</Text>
              <Text style={styles.statLabel}>총 점수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{perfectCount}</Text>
              <Text style={styles.statLabel}>Perfect</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{maxCombo}</Text>
              <Text style={styles.statLabel}>최대 콤보</Text>
            </View>
          </View>
        </View>

        {/* 판정 분포 */}
        <View style={styles.judgementSection}>
          <Text style={styles.sectionTitle}>📊 판정 분포</Text>
          <View style={styles.judgementBars}>
            <View style={styles.judgementItem}>
              <Text style={styles.judgementLabel}>Perfect</Text>
              <View style={styles.judgementBar}>
                <View
                  style={[
                    styles.judgementFill,
                    { width: `${(perfectCount / (perfectCount + goodCount + missCount)) * 100}%`, backgroundColor: '#FFD700' }
                  ]}
                />
              </View>
              <Text style={styles.judgementCount}>{perfectCount}</Text>
            </View>
            <View style={styles.judgementItem}>
              <Text style={styles.judgementLabel}>Good</Text>
              <View style={styles.judgementBar}>
                <View
                  style={[
                    styles.judgementFill,
                    { width: `${(goodCount / (perfectCount + goodCount + missCount)) * 100}%`, backgroundColor: '#4A90E2' }
                  ]}
                />
              </View>
              <Text style={styles.judgementCount}>{goodCount}</Text>
            </View>
            <View style={styles.judgementItem}>
              <Text style={styles.judgementLabel}>Miss</Text>
              <View style={styles.judgementBar}>
                <View
                  style={[
                    styles.judgementFill,
                    { width: `${(missCount / (perfectCount + goodCount + missCount)) * 100}%`, backgroundColor: '#999' }
                  ]}
                />
              </View>
              <Text style={styles.judgementCount}>{missCount}</Text>
            </View>
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>🔄 계속하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
            <Text style={styles.finishButtonText}>🏠 완료</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

import { TouchableOpacity } from 'react-native';

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
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  gradeSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
  },
  gradeEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  gradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  accuracyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 25,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  judgementSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  judgementBars: {
    gap: 10,
  },
  judgementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  judgementLabel: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  judgementBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  judgementFill: {
    height: '100%',
    borderRadius: 4,
  },
  judgementCount: {
    width: 40,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#666',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
