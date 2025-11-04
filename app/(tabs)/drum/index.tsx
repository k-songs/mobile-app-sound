import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// OPTION A: 완전히 새로운 인터랙티브 모드
import InteractiveDrumSet from '../../../components/game/InteractiveDrumSet';
import { InstrumentType } from '../../../constants/drumSounds';

// 통합 모드: 인터랙티브 + 기존 게임 모두 포함
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import DrumGame from '../../../components/game/DrumGame';
import DrumGameOverScreen from '../../../screens/DrumGameOverScreen';
import { DifficultyType } from '../../../constants/drumSounds';
import Animated, { 
  useSharedValue, 
  withSpring, 
  withTiming, 
  interpolate, 
  Easing 
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Index() {
  const insets = useSafeAreaInsets();

  // 통합 모드: 두 모드 모두 사용
  // 인터랙티브 모드용 상태
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType | null>(null);
  
  // 기존 게임 모드용 상태
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyType>('beginner');
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxScore, setFinalMaxScore] = useState(0);
  const [finalPercentage, setFinalPercentage] = useState(0);

  const beginnerScale = useSharedValue(1);
  const intermediateScale = useSharedValue(1);
  const beginnerElevation = useSharedValue(12);
  const intermediateElevation = useSharedValue(12);
  const beginnerShimmer = useSharedValue(0);
  const intermediateShimmer = useSharedValue(0);

  // 인터랙티브 모드 핸들러
  const handleInstrumentPlay = (instrument: InstrumentType) => {
    setCurrentInstrument(instrument);
  };

  // 기존 게임 모드 핸들러들
  const animateButton = (scaleValue: Animated.SharedValue<number>, toValue: number) => {
    scaleValue.value = withSpring(toValue, {
      damping: 3,
      stiffness: 40,
    });
  };

  const animateElevation = (elevationValue: Animated.SharedValue<number>, toValue: number) => {
    elevationValue.value = withSpring(toValue, {
      damping: 3,
      stiffness: 40,
    });
  };

  const animateShimmer = (shimmerValue: Animated.SharedValue<number>) => {
    shimmerValue.value = withTiming(1, {
      duration: 300,
      easing: Easing.linear,
    }, () => {
      shimmerValue.value = 0;
    });
  };

  const handleDifficultyPress = (difficulty: DifficultyType) => {
    setCurrentDifficulty(difficulty);
    if (difficulty === 'beginner') {
      animateButton(beginnerScale, 1.1);
      animateButton(intermediateScale, 1);
    } else {
      animateButton(intermediateScale, 1.1);
      animateButton(beginnerScale, 1);
    }
    handleRestartGame();
  };

  const handleGameComplete = (score: number, maxScore: number, percentage: number) => {
    setFinalScore(score);
    setFinalMaxScore(maxScore);
    setFinalPercentage(percentage);
    setIsGameOver(true);
  };

  const handleRestartGame = () => {
    setIsGameOver(false);
    setFinalScore(0);
    setFinalMaxScore(0);
    setFinalPercentage(0);
    animateButton(beginnerScale, 1);
    animateButton(intermediateScale, 1);
    beginnerElevation.value = 12;
    intermediateElevation.value = 12;
  };

  const handleGoHome = () => {
    router.push("/(tabs)/(home)/" as any);
    setIsGameOver(false);
    animateButton(beginnerScale, 1);
    animateButton(intermediateScale, 1);
    beginnerElevation.value = 12;
    intermediateElevation.value = 12;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* 섹션 1: 인터랙티브 드럼세트 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎵 사운드 테스트</Text>
              <Text style={styles.sectionSubtitle}>
                캐릭터를 움직여 각 악기의 소리를 확인해보세요 !
              </Text>
              {currentInstrument && (
               <Text style={styles.currentInstrument}>
               현재 연주 : <Text style={{ fontWeight: 'bold', color: '#e67009' }}>
                 {currentInstrument.toUpperCase()}
               </Text>
             </Text>
              )}
            </View>
            <InteractiveDrumSet onInstrumentPlay={handleInstrumentPlay} />
          </View>

          {/* 구분선 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>학습 모드</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 섹션 2: 학습 퀴즈 게임 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>드럼 소리 맞히기</Text>
              <Text style={styles.sectionSubtitle}>
                소리를 듣고 정확한 악기를 맞춰보세요!
              </Text>
              
              <View style={styles.difficultyContainer}>
                <TouchableOpacity
                  onPress={() => handleDifficultyPress('beginner')}
                  onPressIn={() => {
                    animateButton(beginnerScale, 1.05);
                    animateElevation(beginnerElevation, 20);
                    animateShimmer(beginnerShimmer);
                  }}
                  onPressOut={() => {
                    animateButton(beginnerScale, currentDifficulty === 'beginner' ? 1.1 : 1);
                    animateElevation(beginnerElevation, 12);
                  }}
                >
                  <Animated.View
                    style={[
                      { transform: [{ scale: beginnerScale.value }] },
                      styles.difficultyButton,
                      { elevation: beginnerElevation.value },
                    ]}
                  >
                    <AnimatedLinearGradient
                      colors={['#FFD700', '#FFA500']}
                      start={{
                        x: interpolate(beginnerShimmer.value, [0, 1], [-0.5, 1.5]),
                        y: 0.5,
                      }}
                      end={{
                        x: interpolate(beginnerShimmer.value, [0, 1], [0.5, 2.5]),
                        y: 0.5,
                      }}
                      style={styles.gradientFill}
                    >
                      <Text style={styles.difficultyText}>맛보기</Text>
                    </AnimatedLinearGradient>
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDifficultyPress('intermediate')}
                  onPressIn={() => {
                    animateButton(intermediateScale, 1.05);
                    animateElevation(intermediateElevation, 20);
                    animateShimmer(intermediateShimmer);
                  }}
                  onPressOut={() => {
                    animateButton(intermediateScale, currentDifficulty === 'intermediate' ? 1.1 : 1);
                    animateElevation(intermediateElevation, 12);
                  }}
                >
                  <Animated.View
                    style={[
                      { transform: [{ scale: intermediateScale.value }] },
                      styles.difficultyButton,
                      { elevation: intermediateElevation.value },
                    ]}
                  >
                    <AnimatedLinearGradient
                      colors={['#FFD700', '#FFA500']}
                      start={{
                        x: interpolate(intermediateShimmer.value, [0, 1], [-0.5, 1.5]),
                        y: 0.5,
                      }}
                      end={{
                        x: interpolate(intermediateShimmer.value, [0, 1], [0.5, 2.5]),
                        y: 0.5,
                      }}
                      style={styles.gradientFill}
                    >
                      <Text style={styles.difficultyText}>도전</Text>
                    </AnimatedLinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 퀴즈 게임 영역 */}
            <View style={styles.gameSection}>
              {!isGameOver ? (
                <DrumGame
                  difficulty={currentDifficulty}
                  onGameComplete={handleGameComplete}
                />
              ) : (
                <DrumGameOverScreen
                  score={finalScore}
                  maxScore={finalMaxScore}
                  onRestart={handleRestartGame}
                  onGoHome={handleGoHome}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // 섹션 스타일
  section: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  sectionHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  currentInstrument: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: '#FFEB3B',
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  
  // 구분선 스타일
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    marginHorizontal: 30,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  // 난이도 선택 스타일
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
    marginTop: 10,
  },
  difficultyButton: {
    borderRadius: 30,
    minWidth: 100,
    elevation: 12, // Android shadow
  },
  gradientFill: {
    flex: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // 쉬머 효과를 위해 추가
  },
  difficultyText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white', // 글자색을 흰색으로 변경
  },
  
  // 게임 섹션 스타일
  gameSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
});