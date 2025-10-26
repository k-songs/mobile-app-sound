import { 
  useState, 
  useCallback, 
  useMemo, 
  useReducer, 
  useRef 
} from 'react';
import { 
  DifficultyLevel, 
  QuestionCount, 
  SoundSpeed, 
  TrainingMode, 
  TRAINING_MODES,
  TIMING_CONFIG,
  MAX_SETS
} from '@/types/game';
import { SOUND_CONFIG } from '@/constants/GameConfig';
import { Logger } from '@/utils/logger';

// 상태 타입 정의
interface GameState {
  gameStarted: boolean;
  currentSound: string | null;
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  currentQuestion: number;
  currentSet: number;
  reactionTimes: number[];
}

// 액션 타입 정의
type GameAction = 
  | { type: 'START_GAME'; payload?: Partial<GameState> }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_SOUND'; sound: string | null }
  | { type: 'HANDLE_CATCH'; reactionTime: number }
  | { type: 'INCREMENT_SET' };

// 리듀서 함수 (순수 함수로 최적화)
function gameReducer(state: GameState, action: GameAction): GameState {
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
        reactionTimes: []
      };
    
    case 'UPDATE_SOUND':
      return {
        ...state,
        currentSound: action.sound
      };
    
    case 'HANDLE_CATCH': {
      const timingConfig = TIMING_CONFIG;
      const reactionTime = action.reactionTime;
      
      if (reactionTime <= timingConfig.PERFECT) {
        return {
          ...state,
          combo: state.combo + 1,
          perfectCount: state.perfectCount + 1,
          maxCombo: Math.max(state.combo + 1, state.maxCombo),
          score: state.score + 100,
          reactionTimes: [...state.reactionTimes, reactionTime],
          currentQuestion: state.currentQuestion + 1
        };
      }
      
      if (reactionTime <= timingConfig.GOOD) {
        return {
          ...state,
          combo: 0,
          goodCount: state.goodCount + 1,
          score: state.score + 50,
          reactionTimes: [...state.reactionTimes, reactionTime],
          currentQuestion: state.currentQuestion + 1
        };
      }
      
      if (reactionTime <= timingConfig.MISS) {
        return {
          ...state,
          combo: 0,
          missCount: state.missCount + 1,
          currentQuestion: state.currentQuestion + 1
        };
      }
      
      return state;
    }
    
    case 'INCREMENT_SET':
      return {
        ...state,
        currentSet: state.currentSet + 1
      };
    
    default:
      return state;
  }
}

export function useTrainingGame() {
  // 초기 상태를 메모이제이션
  const initialState = useRef<GameState>({
    gameStarted: false,
    currentSound: null,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    currentQuestion: 0,
    currentSet: 1,
    reactionTimes: []
  }).current;

  // 리듀서 상태 및 디스패치
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // 설정 상태 (불변성 유지)
  const [settings, setSettings] = useState({
    questionCount: 10,
    difficulty: 'normal' as DifficultyLevel,
    soundSpeed: 'normal' as SoundSpeed,
    trainingMode: 'sound-catch' as TrainingMode
  });

  // 게임 시작 로직 (메모이제이션)
  const startGame = useCallback(() => {
    Logger.gameStart(settings.trainingMode, settings);
    dispatch({ 
      type: 'START_GAME', 
      payload: { 
        gameStarted: true,
        currentSet: gameState.currentSet 
      } 
    });
  }, [settings, gameState.currentSet]);

  // 게임 리셋 로직 (메모이제이션)
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  // 세트 증가 로직 (메모이제이션)
  const incrementSet = useCallback(() => {
    dispatch({ type: 'INCREMENT_SET' });
  }, []);

  // 소리 업데이트 로직 (메모이제이션)
  const updateSound = useCallback((sound: string | null) => {
    dispatch({ type: 'UPDATE_SOUND', sound });
  }, []);

  // 소리 캐치 로직 (메모이제이션)
  const handleSoundCatch = useCallback((reactionTime: number) => {
    const result = dispatch({ type: 'HANDLE_CATCH', reactionTime });
    
    // 로깅 추가
    if (result) {
      Logger.soundCatch(
        reactionTime <= TIMING_CONFIG.PERFECT 
          ? 'Perfect' 
          : reactionTime <= TIMING_CONFIG.GOOD 
            ? 'Good' 
            : 'Miss',
        { reactionTime, score: gameState.score }
      );
    }
  }, [gameState.score]);

  // 게임 완료 여부 계산 (메모이제이션)
  const isGameComplete = useMemo(() => 
    gameState.currentQuestion >= settings.questionCount, 
    [gameState.currentQuestion, settings.questionCount]
  );

  // 정확도 계산 (메모이제이션)
  const calculateAccuracy = useMemo(() => {
    const { questionCount } = settings;
    const { perfectCount, goodCount } = gameState;

    return questionCount > 0 
      ? ((perfectCount + goodCount) / questionCount) * 100 
      : 0;
  }, [gameState.perfectCount, gameState.goodCount, settings.questionCount]);

  // 게임 상태 선택자 (불필요한 리렌더링 방지)
  const selectGameState = useCallback(<K extends keyof GameState>(key: K) => {
    return gameState[key];
  }, [gameState]);

  return {
    gameState,
    settings,
    setSettings,
    startGame,
    resetGame,
    incrementSet,
    updateSound,
    handleSoundCatch,
    isGameComplete,
    calculateAccuracy,
    selectGameState
  };
}
