import { 
  DifficultyLevel, 
  TrainingMode, 
  SoundSpeed 
} from '@/types/game';

// 🎮 게임 설정 유틸리티
export const GameConfig = {
  // 🏆 난이도 설정
  DIFFICULTY: {
    easy: {
      name: '쉬움',
      description: '초보자를 위한 난이도',
      timingThreshold: {
        perfect: 500,
        good: 800,
        miss: 1200
      }
    },
    normal: {
      name: '보통',
      description: '적당한 도전 난이도',
      timingThreshold: {
        perfect: 300,
        good: 600,
        miss: 1000
      }
    },
    hard: {
      name: '어려움',
      description: '숙련자를 위한 난이도',
      timingThreshold: {
        perfect: 200,
        good: 400,
        miss: 800
      }
    }
  },

  // 🎲 훈련 모드 설정
  TRAINING_MODES: {
    'sound-catch': {
      name: '소리 캐치',
      description: '무작위 소리에 빠르게 반응하세요',
      icon: '🎯',
      color: '#4A90E2'
    },
    'hearing-threshold': {
      name: '청취 문지방',
      description: '최소 감지 가능한 소리 찾기',
      icon: '🔊',
      color: '#2ECC71'
    },
    'balance-test': {
      name: '밸런스 테스트',
      description: '좌우 소리 균형 테스트',
      icon: '🎧',
      color: '#FF6B6B'
    }
  },

  // 🔊 소리 속도 설정
  SOUND_SPEED: {
    veryslow: {
      minInterval: 4000,
      maxInterval: 6000,
      label: '매우 느림'
    },
    slow: {
      minInterval: 2500,
      maxInterval: 4500,
      label: '느림'
    },
    normal: {
      minInterval: 1500,
      maxInterval: 3500,
      label: '보통'
    },
    fast: {
      minInterval: 800,
      maxInterval: 2200,
      label: '빠름'
    },
    veryfast: {
      minInterval: 500,
      maxInterval: 1500,
      label: '매우 빠름'
    }
  },

  // 🎵 소리 관련 설정
  SOUND: {
    FREQUENCIES: {
      A4: 440,
      E5: 660
    },
    WAVE_TYPES: {
      SINE: 'sine',
      TRIANGLE: 'triangle'
    },
    STRINGS: ['🔔', '🎵', '🎶', '🎼', '🎹', '🎺', '🎸', '🥁'],
    DISPLAY_DURATION: 800 // ms
  },

  // 🛠️ 유틸리티 메서드
  utils: {
    // 난이도 필터링
    filterDifficulty: (
      predicate: (difficulty: DifficultyLevel) => boolean
    ): DifficultyLevel[] =>
      (Object.keys(GameConfig.DIFFICULTY) as DifficultyLevel[])
        .filter(predicate),

    // 훈련 모드 필터링
    filterTrainingModes: (
      predicate: (mode: TrainingMode) => boolean
    ): TrainingMode[] =>
      (Object.keys(GameConfig.TRAINING_MODES) as TrainingMode[])
        .filter(predicate),

    // 소리 속도 필터링
    filterSoundSpeeds: (
      predicate: (speed: SoundSpeed) => boolean
    ): SoundSpeed[] =>
      (Object.keys(GameConfig.SOUND_SPEED) as SoundSpeed[])
        .filter(predicate),

    // 랜덤 소리 선택
    getRandomSound: () =>
      GameConfig.SOUND.STRINGS[
        Math.floor(Math.random() * GameConfig.SOUND.STRINGS.length)
      ],

    // 난이도별 타이밍 임계값 계산
    calculateTimingThreshold: (difficulty: DifficultyLevel) =>
      GameConfig.DIFFICULTY[difficulty].timingThreshold
  }
};

// 🔊 소리 설정 (별도 export)
export const SOUND_CONFIG = GameConfig.SOUND;

