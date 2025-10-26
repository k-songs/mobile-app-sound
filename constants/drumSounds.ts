export interface DrumInstrument {
  name: string;
  description: string;
  sound: any;
  lottie?: any;
}

export const DRUM_INSTRUMENTS= {
  kick: {
    name: '킥드럼',
    description: '둔탁하고 깊은 저음',
    sound: require('@/assets/sounds/tom_z.mp3'),
    // lottie 제거 - 적절한 애니메이션이 없음
  },
  snare: {
    name: '스네어',
    description: '날카롭고 튀는 소리',
    sound: require('@/assets/sounds/snare_z.mp3'),
    // lottie 제거 - 적절한 애니메이션이 없음
  },
  hihat: {
    name: '하이햇',
    description: '짧고 선명한 금속음',
    sound: require('@/assets/sounds/hat_z.mp3'),
    // lottie 제거 - 적절한 애니메이션이 없음
  },
  cymbal: {
    name: '심벌',
    description: '긴 울림의 금속음',
    sound: require('@/assets/sounds/cymbal_z.mp3'),
    // lottie 제거 - 적절한 애니메이션이 없음
  },
}  as const satisfies Record<string, DrumInstrument>;



export const DIFFICULTY_LEVELS = {
  beginner: {
    name: '초급',
    instruments: ['kick', 'snare'] as const,
    rounds: 5,
    description: '2가지 악기 (킥드럼, 스네어)'
  },
  intermediate: {
    name: '중급',
    instruments: ['kick', 'snare', 'hihat', 'cymbal'] as const ,
    rounds: 10,
    description: '4가지 악기 '
  }
};

export type InstrumentType = keyof typeof DRUM_INSTRUMENTS;
export type DifficultyType = keyof typeof DIFFICULTY_LEVELS;