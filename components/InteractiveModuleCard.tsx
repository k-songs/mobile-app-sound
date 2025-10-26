import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  
} from 'react-native-reanimated';

interface InteractiveModuleCardProps {
  title: string;
  description: string;
  difficulty: string;
  stage: number;
  icon: string;
  gradient: string[];
  onPress: () => void;
  disabled?: boolean;
}

const InteractiveModuleCard: React.FC<InteractiveModuleCardProps> = ({
  title,
  description,
  difficulty,
  stage,
  icon,
  gradient,
  onPress,
  disabled = false
}) => {
  // 애니메이션 값들
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const elevation = useSharedValue(8);

  // 터치 시작 애니메이션
  const handlePressIn = () => {
    if (disabled) return;

    scale.value = withSpring(0.95, {
      damping: 12,
      stiffness: 200
    });
    opacity.value = withTiming(0.8);
    translateY.value = withTiming(-5);
    elevation.value = withTiming(12);
  };

  // 터치 종료 애니메이션
  const handlePressOut = () => {
    if (disabled) return;

    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200
    });
    opacity.value = withTiming(1);
    translateY.value = withTiming(0);
    elevation.value = withTiming(8);
  };

  // 애니메이티드 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
      elevation: elevation.value,
    };
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return '#4CAF50';
      case '중급': return '#FF9800';
      case '고급': return '#F44336';
      default: return '#4A90E2';
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {/* 그라데이션 배경 */}
        <View style={[styles.gradientBackground, { backgroundColor: gradient[0] }]}>
          {/* 스테이지 뱃지 */}
          <View style={styles.stageBadge}>
            <Text style={styles.stageText}>Stage {stage}</Text>
          </View>

          {/* 메인 컨텐츠 */}
          <View style={styles.contentContainer}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* 난이도 뱃지 */}
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(difficulty) }]}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>

        {/* 하단 장식 라인 */}
        <View style={[styles.bottomAccent, { backgroundColor: gradient[0] }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 20,
    borderRadius: 20,
    elevation: 8,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBackground: {
    height: 140,
    borderRadius: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stageBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  stageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomAccent: {
    height: 4,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default InteractiveModuleCard;
