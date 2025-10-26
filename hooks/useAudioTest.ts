import { 
  useState, 
  useCallback, 
  useMemo, 
  useReducer, 
  useRef 
} from 'react';
import { SOUND_CONFIG } from '@/constants/GameConfig';
import { Logger } from '@/utils/logger';

// 오디오 테스트 상태 인터페이스
interface AudioTestState {
  currentVolume: number;
  volumeStep: number;
  thresholdTests: number[];
  testPhase: 'increasing' | 'decreasing' | 'complete';
  heardResponse: boolean | null;
  volumeTestCount: number;
}

// 오디오 테스트 액션 타입
type AudioTestAction = 
  | { type: 'START_TEST' }
  | { type: 'UPDATE_VOLUME'; volume: number }
  | { type: 'RECORD_RESPONSE'; heard: boolean }
  | { type: 'CHANGE_PHASE'; phase: 'increasing' | 'decreasing' | 'complete' }
  | { type: 'RESET_TEST' };

// 리듀서 함수 (순수 함수로 최적화)
function audioTestReducer(state: AudioTestState, action: AudioTestAction): AudioTestState {
  switch (action.type) {
    case 'START_TEST':
      return {
        ...state,
        currentVolume: 0.1,
        volumeStep: 0.1,
        thresholdTests: [],
        testPhase: 'increasing',
        heardResponse: null,
        volumeTestCount: 0
      };
    
    case 'UPDATE_VOLUME':
      return {
        ...state,
        currentVolume: action.volume,
        volumeTestCount: state.volumeTestCount + 1
      };
    
    case 'RECORD_RESPONSE':
      return {
        ...state,
        heardResponse: action.heard,
        thresholdTests: [...state.thresholdTests, state.currentVolume]
      };
    
    case 'CHANGE_PHASE':
      return {
        ...state,
        testPhase: action.phase
      };
    
    case 'RESET_TEST':
      return {
        currentVolume: 0.1,
        volumeStep: 0.1,
        thresholdTests: [],
        testPhase: 'increasing',
        heardResponse: null,
        volumeTestCount: 0
      };
    
    default:
      return state;
  }
}

export function useAudioTest() {
  // 초기 상태를 메모이제이션
  const initialState = useRef<AudioTestState>({
    currentVolume: 0.1,
    volumeStep: 0.1,
    thresholdTests: [],
    testPhase: 'increasing',
    heardResponse: null,
    volumeTestCount: 0
  }).current;

  // 리듀서 상태 및 디스패치
  const [audioTestState, dispatch] = useReducer(audioTestReducer, initialState);

  // 오디오 컨텍스트 생성 (메모이제이션)
  const audioContext = useMemo(() => {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  // 오디오 재생 로직 (메모이제이션)
  const playThresholdSound = useCallback(async () => {
    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(SOUND_CONFIG.FREQUENCIES.A4, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(audioTestState.currentVolume, audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);

      Logger.log('info', '청취 문지방 소리 재생', { 
        volume: audioTestState.currentVolume 
      });

    } catch (error) {
      Logger.log('error', '소리 재생 중 오류 발생', { error });
    }
  }, [audioContext, audioTestState.currentVolume]);

  // 볼륨 조정 로직 (메모이제이션)
  const adjustVolume = useCallback((increase: boolean) => {
    const newVolume = increase 
      ? audioTestState.currentVolume * (1 + audioTestState.volumeStep)
      : audioTestState.currentVolume * (1 - audioTestState.volumeStep);

    dispatch({ 
      type: 'UPDATE_VOLUME', 
      volume: Math.max(0.01, Math.min(1, newVolume)) 
    });
  }, [audioTestState.currentVolume, audioTestState.volumeStep]);

  // 테스트 응답 기록 (메모이제이션)
  const recordResponse = useCallback((heard: boolean) => {
    dispatch({ type: 'RECORD_RESPONSE', heard });
  }, []);

  // 테스트 단계 변경 (메모이제이션)
  const changeTestPhase = useCallback((phase: 'increasing' | 'decreasing' | 'complete') => {
    dispatch({ type: 'CHANGE_PHASE', phase });
  }, []);

  // 테스트 시작 (메모이제이션)
  const startTest = useCallback(() => {
    dispatch({ type: 'START_TEST' });
    Logger.log('info', '청취 문지방 테스트 시작');
  }, []);

  // 테스트 리셋 (메모이제이션)
  const resetTest = useCallback(() => {
    dispatch({ type: 'RESET_TEST' });
    Logger.log('info', '청취 문지방 테스트 리셋');
  }, []);

  // 청취 문지방 계산 (메모이제이션)
  const calculateThreshold = useMemo(() => {
    const { thresholdTests } = audioTestState;
    
    if (thresholdTests.length === 0) return null;

    const sortedTests = [...thresholdTests].sort((a, b) => a - b);
    const medianIndex = Math.floor(sortedTests.length / 2);
    
    return sortedTests[medianIndex];
  }, [audioTestState.thresholdTests]);

  // 테스트 상태 선택자 (불필요한 리렌더링 방지)
  const selectAudioTestState = useCallback(<K extends keyof AudioTestState>(key: K) => {
    return audioTestState[key];
  }, [audioTestState]);

  return {
    audioTestState,
    playThresholdSound,
    adjustVolume,
    recordResponse,
    changeTestPhase,
    startTest,
    resetTest,
    calculateThreshold,
    selectAudioTestState
  };
}
