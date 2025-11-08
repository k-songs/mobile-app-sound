import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import InteractiveDrumSet from '../../../components/game/InteractiveDrumSet';
import DrumGame from '../../../components/game/DrumGame';
import DrumGameOverScreen from '../../../screens/DrumGameOverScreen';
import { InstrumentType, DifficultyType, DRUM_INSTRUMENTS } from '../../../constants/drumSounds';

export default function Index() {
  const insets = useSafeAreaInsets();

  // 상태 관리
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyType>('beginner');
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxScore, setFinalMaxScore] = useState(0);

  // 애니메이션 값들
  const beginnerScale = useSharedValue(1);
  const intermediateScale = useSharedValue(1);

  // 인터랙티브 모드 핸들러
  const handleInstrumentPlay = (instrument: InstrumentType) => {
    setCurrentInstrument(instrument);
  };

  // 난이도 선택
  const handleDifficultyPress = (difficulty: DifficultyType) => {
    setCurrentDifficulty(difficulty);
    beginnerScale.value = withSpring(difficulty === 'beginner' ? 1.1 : 1);
    intermediateScale.value = withSpring(difficulty === 'intermediate' ? 1.1 : 1);
    handleRestartGame();
  };

  // 게임 완료
  const handleGameComplete = (score: number, maxScore: number, percentage: number) => {
    setFinalScore(score);
    setFinalMaxScore(maxScore);
    setIsGameOver(true);
  };

  // 게임 재시작
  const handleRestartGame = () => {
    setIsGameOver(false);
    setFinalScore(0);
    setFinalMaxScore(0);
  };

  // 홈으로 이동
  const handleGoHome = () => {
    setIsGameOver(false);
    beginnerScale.value = withSpring(1);
    intermediateScale.value = withSpring(1);
  };

  // 애니메이션 스타일
  const beginnerButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beginnerScale.value }],
  }));

  const intermediateButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: intermediateScale.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
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
                 {DRUM_INSTRUMENTS[currentInstrument].name}
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
                  activeOpacity={0.7}
                  style={styles.difficultyTouchable}
                >
                  <Animated.View style={[
                    styles.difficultyButton,
                    beginnerButtonStyle,
                    currentDifficulty === 'beginner' && styles.difficultyButtonActive
                  ]}>
                    <Text style={[
                      styles.difficultyEmoji,
                      currentDifficulty === 'beginner' && styles.emojiActive
                    ]}>
                      🎵
                    </Text>
                    <Text style={[
                      styles.difficultyText,
                      currentDifficulty === 'beginner' && styles.difficultyTextActive
                    ]}>
                      맛보기
                    </Text>
                    <Text style={[
                      styles.difficultySubtext,
                      currentDifficulty === 'beginner' && styles.difficultySubtextActive
                    ]}>
                      2가지 악기 · 5문제
                    </Text>
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDifficultyPress('intermediate')}
                  activeOpacity={0.7}
                  style={styles.difficultyTouchable}
                >
                  <Animated.View style={[
                    styles.difficultyButton,
                    intermediateButtonStyle,
                    currentDifficulty === 'intermediate' && styles.difficultyButtonActive
                  ]}>
                    <Text style={[
                      styles.difficultyEmoji,
                      currentDifficulty === 'intermediate' && styles.emojiActive
                    ]}>
                      🔥
                    </Text>
                    <Text style={[
                      styles.difficultyText,
                      currentDifficulty === 'intermediate' && styles.difficultyTextActive
                    ]}>
                      도전
                    </Text>
                    <Text style={[
                      styles.difficultySubtext,
                      currentDifficulty === 'intermediate' && styles.difficultySubtextActive
                    ]}>
                      4가지 악기 · 10문제
                    </Text>
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
      </View>
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
  difficultyTouchable: {
    flex: 1,
    maxWidth: 160,
  },
  difficultyButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    elevation: 3,
  },
  difficultyButtonActive: {
    backgroundColor: '#4CAF50',
    elevation: 6,
  },
  difficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  emojiActive: {
    opacity: 1,
  },
  difficultyText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#757575',
    marginBottom: 4,
  },
  difficultyTextActive: {
    color: 'white',
  },
  difficultySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  difficultySubtextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // 게임 섹션 스타일
  gameSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
});