/**
 * 🎮 게임 타입 정의
 */

import { GenericState, ArrayUtils, ObjectUtils } from './common';

// 🎮 게임 관련 기본 타입들
export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type QuestionCount = 5 | 10 | 15;
export type SoundSpeed = 'veryslow' | 'slow' | 'normal' | 'fast' | 'veryfast';
export type TrainingMode = 'sound-catch' | 'hearing-threshold' | 'balance-test';

// 🏆 게임 결과 인터페이스
export interface GameResult {
  totalQuestions: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  totalScore: number;
  maxCombo: number;
  averageReactionTime: number;
  completedSets: number;
}

// ⏱️ 타이밍 설정 인터페이스
export interface TimingConfig {
  perfect: number;
  good: number;
  miss: number;
}

// 🎲 게임 설정 인터페이스
export interface GameSettings {
  questionCount: QuestionCount;
  difficulty: DifficultyLevel;
  soundSpeed: SoundSpeed;
  trainingMode: TrainingMode;
}

// 🌟 난이도 설정 인터페이스
export interface DifficultyConfig {
  name: string;
  description: string;
  timing: TimingConfig;
}

// 🎯 훈련 모드 설정 인터페이스
export interface TrainingModeConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
}

// 🔊 소리 관련 설정
export const SOUND_CONFIG = {
  FREQUENCIES: {
    A4: 440,
    E5: 660
  },
  WAVE_TYPES: {
    SINE: 'sine',
    TRIANGLE: 'triangle'
  }
};

// 🎳 타이밍 설정 상수
export const TIMING_CONFIG: Record<DifficultyLevel, TimingConfig> = {
  easy: { perfect: 500, good: 800, miss: 1200 },
  normal: { perfect: 300, good: 600, miss: 1000 },
  hard: { perfect: 200, good: 400, miss: 800 }
};

// 🏁 난이도 설정 상수
export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: '쉬움',
    description: '초보자를 위한 난이도',
    timing: TIMING_CONFIG.easy
  },
  normal: {
    name: '보통',
    description: '적당한 도전 난이도',
    timing: TIMING_CONFIG.normal
  },
  hard: {
    name: '어려움',
    description: '숙련자를 위한 난이도',
    timing: TIMING_CONFIG.hard
  }
};

// 🎮 훈련 모드 설정 상수
export const TRAINING_MODES: Record<TrainingMode, TrainingModeConfig> = {
  'sound-catch': {
    name: '소리 캐치',
    description: '소리를 빠르게 감지하세요',
    icon: '🎯',
    color: '#4A90E2'
  },
  'hearing-threshold': {
    name: '청취 문지방',
    description: '소리의 최소 감지 지점을 찾아보세요',
    icon: '🔊',
    color: '#2ECC71'
  },
  'balance-test': {
    name: '밸런스 테스트',
    description: '좌우 소리 균형을 테스트하세요',
    icon: '🎧',
    color: '#FF6B6B'
  }
};

// 🧩 게임 상태 타입
export type GameStateType = GenericState<{
  settings: GameSettings;
  result: GameResult | null;
}>;

// 🛠️ 유틸리티 함수들
export const GameUtils = {
  // 게임 결과 계산
  calculateGameResult: (
    settings: GameSettings,
    rawResult: Partial<GameResult>
  ): GameResult => ({
    totalQuestions: settings.questionCount,
    perfectCount: rawResult.perfectCount || 0,
    goodCount: rawResult.goodCount || 0,
    missCount: rawResult.missCount || 0,
    totalScore: rawResult.totalScore || 0,
    maxCombo: rawResult.maxCombo || 0,
    averageReactionTime: rawResult.averageReactionTime || 0,
    completedSets: rawResult.completedSets || 0
  }),

  // 난이도별 게임 설정 필터링
  filterDifficultySettings: (
    predicate: (config: DifficultyConfig) => boolean
  ): DifficultyConfig[] =>
    Object.values(DIFFICULTY_SETTINGS).filter(predicate),

  // 훈련 모드 필터링
  filterTrainingModes: (
    predicate: (config: TrainingModeConfig) => boolean
  ): TrainingModeConfig[] =>
    Object.values(TRAINING_MODES).filter(predicate)
};

// 📋 상수들
export const MAX_SETS = 3;
export const QUESTION_COUNT_OPTIONS: QuestionCount[] = [5, 10, 15];

// 🔊 소리 속도 설정
export interface SoundSpeedConfig {
  minInterval: number;
  maxInterval: number;
  label: string;
}

export const SOUND_SPEED_CONFIG: Record<SoundSpeed, SoundSpeedConfig> = {
  veryslow: { minInterval: 4000, maxInterval: 6000, label: '매우 느림' },
  slow: { minInterval: 2500, maxInterval: 4500, label: '느림' },
  normal: { minInterval: 1500, maxInterval: 3500, label: '보통' },
  fast: { minInterval: 800, maxInterval: 2200, label: '빠름' },
  veryfast: { minInterval: 500, maxInterval: 1500, label: '매우 빠름' },
};

