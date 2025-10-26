
/*  '🥁''🔔' '🎵'*/
// constants/drumSounds.tsx 파일에서 이렇게 변경할 수 있습니다.

// 각 드럼 악기에 대한 모든 정보를 포함하는 통합된 인터페이스
export interface DrumInstrument {
  name: string;
  description: string;
  sound: any; // 
  lottie?: any; //

}

export const DRUM_INSTRUMENTS= {
  kick: {
    name: '킥드럼',
    description: '둔탁하고 깊은 저음',
    sound: require('@/assets/sounds/tom_z.mp3'),
    lottie: require('@/assets/lottie/effort.json'), 
  },
  snare: {
    name: '스네어',
    description: '날카롭고 튀는 소리',
    sound: require('@/assets/sounds/snare_z.mp3'),
    lottie: require('@/assets/lottie/shilvermedal.json'), 
  },
  hihat: {
    name: '하이햇',
    description: '짧고 선명한 금속음',
    sound: require('@/assets/sounds/hat_z.mp3'),
    lottie: require('@/assets/lottie/shilvermedal.json'), 
  },
  cymbal: {
    name: '심벌',
    description: '긴 울림의 금속음',
    sound: require('@/assets/sounds/cymbal_z.mp3'),
    lottie:  require('@/assets/lottie/shilvermedal.json') 
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