import React, { useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { useSharedValue } from "react-native-reanimated";

// 컴포넌트 임포트
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { GameSettingsMenu } from "@/components/GameSettingsMenu";
import { GameResultModal } from "@/components/GameResultModal";
import { LevelUpModal } from "@/components/LevelUpModal";
import AnimatedButton from "@/components/AnimatedButton";
import InteractiveModuleCard from "@/components/InteractiveModuleCard";

// 애니메이션 컴포넌트
import { BurstAnimation, JudgementAnimation, ParticleExplosion, RelicAnimation } from '@/components/animations';
import { PixiStageTransition } from '@/components/PixiStageTransition';
import { ComboCelebration } from '@/components/ComboCelebration';

// 타입 및 상수
import {
  DifficultyLevel,
  QuestionCount,
  GameResult,
  TrainingMode,
  SoundSpeed,
  MAX_SETS,
  SOUND_SPEED_CONFIG
} from "@/types/game";
import { useAvatarProgress } from "@/hooks/useAvatarProgress";
import { AVATAR_LEVELS, AvatarLevel } from "@/types/avatar";
import { Colors, Layout, Typography, Buttons, GameStyles } from '@/constants/GlobalStyles';
import { GameConfig, SOUND_CONFIG } from '@/constants/GameConfig';

// 상태 리듀서 정의
type GameState = {
  gameStarted: boolean;
  currentSound: string | null;
  soundTimestamp: number | null;
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  currentQuestion: number;
  currentSet: number;
  reactionTimes: number[];
  judgement: "Perfect" | "Good" | "Miss" | null;
};

type GameAction = 
  | { type: 'START_GAME'; payload?: Partial<GameState> }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_SOUND'; sound: string | null }
  | { type: 'HANDLE_CATCH'; reactionTime: number }
  | { type: 'INCREMENT_SET' }
  | { type: 'SET_JUDGEMENT'; judgement: "Perfect" | "Good" | "Miss" | null };

function gameReducer(state: GameState, action: GameAction, settings?: any): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStarted: true,
        score: 0,
        combo: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0,
        currentQuestion: 0,
        reactionTimes: [],
        maxCombo: 0,
        judgement: null,
        ...action.payload
      };

    case 'RESET_GAME':
      return {
        ...state,
        gameStarted: false,
        currentSet: 1,
        score: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0,
        currentQuestion: 0,
        reactionTimes: [],
        judgement: null
      };

    case 'UPDATE_SOUND':
      return { ...state, currentSound: action.sound };

    case 'HANDLE_CATCH': {
      if (!settings) return state;
      const timingConfig = GameConfig.DIFFICULTY[settings.difficulty as DifficultyLevel].timingThreshold;
      const reactionTime = action.reactionTime;
      
      if (reactionTime <= timingConfig.perfect) {
        return {
          ...state,
          combo: state.combo + 1,
          perfectCount: state.perfectCount + 1,
          maxCombo: Math.max(state.combo + 1, state.maxCombo),
          score: state.score + 100,
          reactionTimes: [...state.reactionTimes, reactionTime],
          currentQuestion: state.currentQuestion + 1,
          judgement: 'Perfect'
        };
      }
      
      if (reactionTime <= timingConfig.good) {
        return {
          ...state,
          combo: 0,
          goodCount: state.goodCount + 1,
          score: state.score + 50,
          reactionTimes: [...state.reactionTimes, reactionTime],
          currentQuestion: state.currentQuestion + 1,
          judgement: 'Good'
        };
      }
      
      if (reactionTime <= timingConfig.miss) {
        return {
          ...state,
          combo: 0,
          missCount: state.missCount + 1,
          currentQuestion: state.currentQuestion + 1,
          judgement: 'Miss'
        };
      }
      
      return state;
    }
    
    case 'INCREMENT_SET':
      return { ...state, currentSet: state.currentSet + 1 };
    
    case 'SET_JUDGEMENT':
      return { ...state, judgement: action.judgement };
    
    default:
      return state;
  }
}

export default function LearnIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // 아바타 시스템
  const {
    progress: avatarProgress,
    currentLevelInfo,
    nextLevelInfo,
    levelProgress,
    isLeveledUp,
    newLevelInfo,
    addPerfects,
    closeLevelUpModal,
  } = useAvatarProgress();
  
  // 게임 상태 관리
  const [gameState, dispatch] = useReducer((state: GameState, action: GameAction) => gameReducer(state, action, settings), {
    gameStarted: false,
    currentSound: null,
    soundTimestamp: null,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    currentQuestion: 0,
    currentSet: 1,
    reactionTimes: [],
    judgement: null
  });

  // 게임 설정 상태
  const [settings, setSettings] = useState({
    questionCount: 10,
    difficulty: 'normal' as DifficultyLevel,
    soundSpeed: 'normal' as SoundSpeed,
    trainingMode: 'sound-catch' as TrainingMode
  });

  // 추가 상태 변수들
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showRelicAnimation, setShowRelicAnimation] = useState(false);
  const [relicType, setRelicType] = useState<'confetti' | 'treasure' | 'sparkle' | 'medal' | 'levelup'>('confetti');
  const [showStageTransition, setShowStageTransition] = useState(false);
  const [stageTransition, setStageTransition] = useState<{ from: number; to: number } | null>(null);
  const [showComboCelebration, setShowComboCelebration] = useState(false);
  const [comboCelebrationCount, setComboCelebrationCount] = useState(0);
  const [judgement, setJudgement] = useState<"Perfect" | "Good" | "Miss" | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showParticleExplosion, setShowParticleExplosion] = useState(false);
  
  // 애니메이션 상태들
  const [currentVolume, setCurrentVolume] = useState(0.1);
  const [volumeStep, setVolumeStep] = useState(0.1);
  const [thresholdTests, setThresholdTests] = useState<number[]>([]);
  const [testPhase, setTestPhase] = useState<'increasing' | 'decreasing' | 'complete'>('increasing');
  const [heardResponse, setHeardResponse] = useState<boolean | null>(null);
  const [volumeTestCount, setVolumeTestCount] = useState(0);
  const [correctSide, setCorrectSide] = useState<'left' | 'right' | null>(null);
  const [balanceTestCount, setBalanceTestCount] = useState(0);
  const [balanceScore, setBalanceScore] = useState(0);
  const [balanceGameStarted, setBalanceGameStarted] = useState(false);

  // 애니메이션 값들
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const burstRotation = useSharedValue(0);
  const judgementScale = useSharedValue(0);
  const judgementOpacity = useSharedValue(0);

  // 게임 시작 로직
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  // 게임 리셋 로직
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  // 세트 완료 로직
  const finishSet = useCallback(() => {
    const avgReactionTime = gameState.reactionTimes.length > 0
      ? gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length
      : 0;

    const result: GameResult = {
      totalQuestions: settings.questionCount,
      perfectCount: gameState.perfectCount,
      goodCount: gameState.goodCount,
      missCount: gameState.missCount,
      totalScore: gameState.score,
      maxCombo: gameState.maxCombo,
      averageReactionTime: avgReactionTime,
      completedSets: gameState.currentSet,
    };

    // 아바타 진행도 업데이트
    const oldTotalPerfects = avatarProgress.totalPerfects;
    const calculatedAccuracy = calculateAccuracy();
    addPerfects(gameState.perfectCount, calculatedAccuracy);

    

    dispatch({ type: 'RESET_GAME' });
  }, [gameState, settings, avatarProgress, addPerfects]);

  // 정확도 계산 로직
  const calculateAccuracy = useCallback(() => {
    const totalQuestions = settings.questionCount;

    switch (settings.trainingMode) {
      case 'sound-catch':
        return totalQuestions > 0
          ? ((gameState.perfectCount + gameState.goodCount) / totalQuestions) * 100
          : 0;
      case 'hearing-threshold':
        // 청취 문지방 로직 (기존 코드와 유사)
        return 0;
      case 'balance-test':
        // 밸런스 테스트 로직 (기존 코드와 유사)
        return 0;
      default:
        return 0;
    }
  }, [gameState, settings]);

  // 게임 로직 함수들 (간단히 구현)
  const continueGame = useCallback(() => {
    setShowResult(false);
    dispatch({ type: 'INCREMENT_SET' });
    startGame();
  }, [startGame]);

  // 애니메이션 함수들
  const triggerParticleExplosion = useCallback(() => {
    setShowParticleExplosion(true);
    setTimeout(() => setShowParticleExplosion(false), 1200);
  }, []);

  const triggerBurstAnimation = useCallback(() => {
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 800);
  }, []);

  const triggerJudgementAnimation = useCallback(() => {
    setJudgement(gameState.judgement);
    setTimeout(() => setJudgement(null), 1000);
  }, [gameState.judgement]);

  const triggerRelicAnimation = useCallback((type: 'confetti' | 'treasure' | 'sparkle' | 'medal' | 'levelup') => {
    setRelicType(type);
    setShowRelicAnimation(true);
    setTimeout(() => setShowRelicAnimation(false), 2000);
  }, []);

  // 게임 완료 처리 (간단한 버전)
  const handleFinishSet = useCallback(() => {
    const avgReactionTime = gameState.reactionTimes.length > 0
      ? gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length
      : 0;

    const result: GameResult = {
      totalQuestions: settings.questionCount,
      perfectCount: gameState.perfectCount,
      goodCount: gameState.goodCount,
      missCount: gameState.missCount,
      totalScore: gameState.score,
      maxCombo: gameState.maxCombo,
      averageReactionTime: avgReactionTime,
      completedSets: gameState.currentSet,
    };

    // 아바타 진행도 업데이트
    const calculatedAccuracy = calculateAccuracy();
    addPerfects(gameState.perfectCount, calculatedAccuracy);

    setGameResult(result);
    setShowResult(true);
    dispatch({ type: 'RESET_GAME' });
  }, [gameState, settings, calculateAccuracy, addPerfects]);

  // 기본 UI 렌더링
  if (gameState.gameStarted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.gameContainer}>
          <Text style={styles.gameTitle}>게임 진행 중...</Text>
          <Text>점수: {gameState.score}</Text>
          <Text>콤보: {gameState.combo}</Text>
          <Text>Perfect: {gameState.perfectCount}</Text>

          <TouchableOpacity style={styles.stopButton} onPress={resetGame}>
            <Text style={styles.stopButtonText}>게임 종료</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 메뉴 버튼 */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <View style={styles.gameModeHeader}>
          <Text style={styles.gameModeTitle}>🎮 청능 훈련 아카데미</Text>
          <Text style={styles.gameModeSubtitle}>듣는 힘을 키워보세요!</Text>
        </View>
        
        {/* 아바타 표시 */}
        <View style={styles.avatarSection}>
          <AvatarDisplay
            avatarInfo={currentLevelInfo}
            progress={levelProgress}
            size="medium"
            showProgress={true}
            showScore={true}
            currentScore={gameState.score}
            hearts={5}
            isNewLevel={isLeveledUp}
          />
        </View>

        {/* 게임 모드 선택 */}
        <View style={styles.stage1ModesContainer}>
          <Text style={styles.stage1ModesTitle}>🎯 1단계: 소리 인지 훈련</Text>

          <TouchableOpacity
            style={styles.stage1ModeCard}
            onPress={() => {
              setSettings(prev => ({ ...prev, trainingMode: 'sound-catch' }));
              startGame();
            }}
          >
            <Text style={styles.stage1ModeIcon}>🎯</Text>
            <Text style={styles.stage1ModeTitle}>소리 캐치</Text>
            <Text style={styles.stage1ModeDescription}>소리를 빠르게 감지하세요</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.stage1ModeCard}
            onPress={() => {
              setSettings(prev => ({ ...prev, trainingMode: 'hearing-threshold' }));
              startGame();
            }}
          >
            <Text style={styles.stage1ModeIcon}>🔊</Text>
            <Text style={styles.stage1ModeTitle}>청취 문지방</Text>
            <Text style={styles.stage1ModeDescription}>소리의 최소 감지 지점을 찾아보세요</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.stage1ModeCard}
            onPress={() => {
              setSettings(prev => ({ ...prev, trainingMode: 'balance-test' }));
              startGame();
            }}
          >
            <Text style={styles.stage1ModeIcon}>🎧</Text>
            <Text style={styles.stage1ModeTitle}>밸런스 테스트</Text>
            <Text style={styles.stage1ModeDescription}>좌우 소리 균형을 테스트하세요</Text>
        </TouchableOpacity>
        </View>

        {/* 2, 3단계 모듈 */}
        <InteractiveModuleCard
          title="소리 분별"
          description="음높이와 길이 차이 구분"
          difficulty="중급"
          stage={2}
          icon="🎵"
          gradient={['#9B59B6', '#8E44AD']}
          onPress={() => router.push('/learn/discrimination')}
        />

        <InteractiveModuleCard
          title="소리 식별"
          description="단어와 음성 패턴 인식"
          difficulty="고급"
          stage={3}
          icon="🔤"
          gradient={['#E67E22', '#D35400']}
          onPress={() => router.push('/learn/identification')}
        />
      </ScrollView>

      {/* 모달들 */}
      <GameSettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={{
          questionCount: settings.questionCount as QuestionCount,
          difficulty: settings.difficulty,
          soundSpeed: settings.soundSpeed,
          trainingMode: settings.trainingMode as TrainingMode,
        }}
        onSettingsChange={(newSettings) => setSettings({
          questionCount: newSettings.questionCount,
          difficulty: newSettings.difficulty,
          soundSpeed: newSettings.soundSpeed,
          trainingMode: newSettings.trainingMode as TrainingMode,
        })}
      />

      {gameResult && (
        <GameResultModal
          visible={showResult}
          result={gameResult}
          onContinue={gameResult.completedSets < MAX_SETS ? continueGame : () => {}}
          onFinish={resetGame}
          canContinue={gameResult.completedSets < MAX_SETS}
          currentSet={gameResult.completedSets}
          maxSets={MAX_SETS}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightest,
  },
  menuButton: {
    ...Buttons.secondary,
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  menuIcon: {
    ...Typography.icon,
    color: Colors.primary.main,
  },
  content: {
    flex: 1,
    paddingTop: 100,
  },
  gameModeHeader: {
    ...Layout.header,
    backgroundColor: Colors.primary.darkest,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  gameModeTitle: {
    ...Typography.title,
    color: Colors.text.inverse,
  },
  gameModeSubtitle: {
    ...Typography.subtitle,
    color: Colors.neutral.light,
  },
  avatarSection: {
    ...Layout.card,
    alignItems: 'center',
    marginBottom: 20,
  },
  stage1ModesContainer: {
    ...Layout.card,
    marginBottom: 20,
  },
  stage1ModesTitle: {
    ...Typography.titleSmall,
    color: Colors.primary.main,
  },
  stage1Modes: {
    gap: 15,
    marginTop: 15,
  },
  stage1ModeCard: {
    ...Layout.card,
    borderWidth: 2,
    borderColor: Colors.border.default,
    padding: 15,
  },
  stage1ModeIcon: {
    ...Typography.iconLarge,
    textAlign: 'center',
  },
  stage1ModeTitle: {
    ...Typography.bodyBold,
    textAlign: 'center',
  },
  stage1ModeDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTitle: {
    ...Typography.title,
    marginBottom: 20,
  },
  stopButton: {
    ...Buttons.secondary,
    backgroundColor: Colors.neutral.medium,
  },
  stopButtonText: {
    ...Typography.buttonText,
    color: Colors.text.inverse,
  },
});
