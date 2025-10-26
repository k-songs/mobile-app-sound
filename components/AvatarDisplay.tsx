import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { AvatarLevel } from '@/types/avatar';

interface AvatarDisplayProps {
  avatarInfo: AvatarLevel;
  progress: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showScore?: boolean;
  currentScore?: number;
  hearts?: number;
  isNewLevel?: boolean;
}

/**
 * 🎭 아바타 표시 컴포넌트
 * 
 * Lottie 파일 적용 시:
 * 1. react-native-lottie 설치
 * 2. emoji 대신 Lottie 애니메이션으로 교체
 * 3. stage별로 다른 Lottie 파일 매핑
 */
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarInfo,
  progress,
  size = 'medium',
  showProgress = true,
  showScore = false,
  currentScore = 0,
  hearts = 5,
  isNewLevel = false,
}) => {
  // 🎮 게임 스타일 애니메이션
  const floatAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  // 호버링 애니메이션 (캐릭터가 살짝 떠오르는 효과)
  React.useEffect(() => {
    floatAnimation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // 새 레벨 달성 시 특별 애니메이션
    if (isNewLevel) {
      scaleAnimation.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 100 })
      );

      glowAnimation.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 1000 })
      );
    }
  }, [isNewLevel]);
  const sizeStyles = {
    small: { emoji: 40, container: 60 },
    medium: { emoji: 80, container: 100 },
    large: { emoji: 120, container: 150 },
  };

  const currentSize = sizeStyles[size];

  // 🎭 애니메이션 스타일들
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatAnimation.value },
      { scale: scaleAnimation.value }
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
  }));

  return (
    <View style={styles.container}>
      {/* 🌟 글로우 효과 (새 레벨 달성 시) */}
      <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />

      {/* 🎮 게임 스타일 아바타 카드 배경 */}
      <View style={[styles.avatarCard, { borderColor: avatarInfo.color }]}>
        {/* 상단 게임 정보 바 */}
        <View style={styles.gameInfoBar}>
          {/* 하트 (생명) */}
          <View style={styles.heartsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Text key={index} style={[
                styles.heart,
                { opacity: index < hearts ? 1 : 0.3 }
              ]}>
                ❤️
              </Text>
            ))}
          </View>

          {/* 점수 */}
          {showScore && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>점수</Text>
              <Text style={[styles.scoreValue, { color: avatarInfo.color }]}>
                {currentScore.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* 🎭 애니메이션 아바타 */}
        <Animated.View
          style={[
            styles.avatarContainer,
            avatarAnimatedStyle,
            {
              width: currentSize.container,
              height: currentSize.container,
              backgroundColor: `${avatarInfo.color}15`,
              borderColor: avatarInfo.color,
            }
          ]}
        >
          {/* 캐릭터 이모지 */}
          <Text style={{ fontSize: currentSize.emoji }}>
            {avatarInfo.emoji}
          </Text>

          {/* ✨ 반짝임 효과 (새 레벨 시) */}
          {isNewLevel && (
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.sparkle}>⭐</Text>
              <Text style={styles.sparkle}>🌟</Text>
            </View>
          )}
        </Animated.View>

        {/* 🎯 레벨과 이름 정보 */}
        <View style={styles.infoSection}>
          <View style={[styles.levelBadge, { backgroundColor: avatarInfo.color }]}>
            <Text style={styles.levelText}>Lv.{avatarInfo.level}</Text>
          </View>

          <View style={styles.nameSection}>
            <Text style={styles.avatarName}>{avatarInfo.name}</Text>
            <Text style={styles.avatarDesc}>{avatarInfo.description}</Text>
          </View>
        </View>

        {/* 📊 진행률 바 */}
        {showProgress && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: avatarInfo.color,
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#FFD700',
    borderRadius: 30,
    opacity: 0.6,
    elevation: 10,
  },
  avatarCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    borderWidth: 3,
    elevation: 8,
    minWidth: 200,
  },
  gameInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  heart: {
    fontSize: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    marginBottom: 15,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    color: '#FFD700',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  levelBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 3,
    marginBottom: 8,
  },
  levelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nameSection: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  avatarDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressBar: {
    width: 150,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});


