/**
 * 🎭 아바타 시스템 타입 정의
 */

export type AvatarStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'master';

export interface AvatarLevel {
  level: number;
  stage: AvatarStage;
  name: string;
  emoji: string; // Lottie 적용 전 임시 이모지
  description: string;
  requiredPerfects: number;
  color: string;
  unlockMessage: string;
}

export interface UserProgress {
  currentLevel: number;
  totalPerfects: number;
  totalTrainingSessions: number;
  consecutiveDays: number;
  averageAccuracy: number;
  lastTrainingDate: string;
}

// 아바타 레벨 정의
export const AVATAR_LEVELS: AvatarLevel[] = [
  {
    level: 1,
    stage: 'seed',
    name: '씨앗 귀',
    emoji: '🌱',
    description: '청각 훈련을 막 시작했어요',
    requiredPerfects: 0,
    color: '#A8E6CF',
    unlockMessage: '청능 훈련의 첫 걸음을 시작했습니다!',
  },
  {
    level: 2,
    stage: 'seed',
    name: '튼튼한 씨앗',
    emoji: '🌱',
    description: '꾸준히 훈련하고 있어요',
    requiredPerfects: 30,
    color: '#8FD9A8',
    unlockMessage: '씨앗이 튼튼해지고 있어요!',
  },
  {
    level: 3,
    stage: 'sprout',
    name: '새싹 귀',
    emoji: '🌿',
    description: '소리를 감지하기 시작했어요',
    requiredPerfects: 100,
    color: '#76C893',
    unlockMessage: '새싹이 돋아났어요! 소리가 들리기 시작합니다.',
  },
  {
    level: 4,
    stage: 'sprout',
    name: '자라나는 새싹',
    emoji: '🌿',
    description: '청각이 점점 발달하고 있어요',
    requiredPerfects: 200,
    color: '#52B788',
    unlockMessage: '새싹이 무럭무럭 자라나고 있어요!',
  },
  {
    level: 5,
    stage: 'bud',
    name: '꽃봉오리 귀',
    emoji: '🌺',
    description: '소리를 명확하게 구분해요',
    requiredPerfects: 350,
    color: '#FFB4E6',
    unlockMessage: '꽃봉오리가 맺혔어요! 소리 구분 능력이 향상됐습니다.',
  },
  {
    level: 6,
    stage: 'bud',
    name: '피어나는 꽃봉오리',
    emoji: '🌺',
    description: '청각 능력이 크게 향상됐어요',
    requiredPerfects: 500,
    color: '#FFA0DD',
    unlockMessage: '꽃봉오리가 피어날 준비를 하고 있어요!',
  },
  {
    level: 7,
    stage: 'bud',
    name: '활짝 펼쳐지는 봉오리',
    emoji: '🌺',
    description: '뛰어난 청각 능력을 가졌어요',
    requiredPerfects: 700,
    color: '#FF8CD4',
    unlockMessage: '곧 활짝 피어날 거예요!',
  },
  {
    level: 8,
    stage: 'bloom',
    name: '활짝 핀 귀',
    emoji: '🌸',
    description: '명확한 청각 능력의 소유자',
    requiredPerfects: 1000,
    color: '#FFD6E8',
    unlockMessage: '축하합니다! 꽃이 활짝 피었어요! 🎊',
  },
  {
    level: 9,
    stage: 'bloom',
    name: '찬란한 꽃',
    emoji: '🌸',
    description: '탁월한 청각 능력을 보유했어요',
    requiredPerfects: 1500,
    color: '#FFC2DD',
    unlockMessage: '꽃이 더욱 찬란하게 빛나고 있어요!',
  },
  {
    level: 10,
    stage: 'bloom',
    name: '완전히 만개한 꽃',
    emoji: '🌸',
    description: '최고 수준의 청각 능력',
    requiredPerfects: 2000,
    color: '#FFAED4',
    unlockMessage: '완벽하게 만개했어요! 정말 대단해요!',
  },
  {
    level: 11,
    stage: 'master',
    name: '빛나는 귀',
    emoji: '✨',
    description: '청각 마스터의 경지',
    requiredPerfects: 3000,
    color: '#FFD700',
    unlockMessage: '🏆 마스터 레벨 달성! 빛나는 청각의 달인이 되었습니다!',
  },
];

// 다음 레벨 정보 가져오기
export const getNextLevel = (currentLevel: number): AvatarLevel | null => {
  return AVATAR_LEVELS.find(level => level.level === currentLevel + 1) || null;
};

// 현재 레벨 정보 가져오기
export const getCurrentLevelInfo = (totalPerfects: number): AvatarLevel => {
  // 역순으로 검색하여 현재 달성한 가장 높은 레벨 찾기
  for (let i = AVATAR_LEVELS.length - 1; i >= 0; i--) {
    if (totalPerfects >= AVATAR_LEVELS[i].requiredPerfects) {
      return AVATAR_LEVELS[i];
    }
  }
  return AVATAR_LEVELS[0]; // 기본 레벨
};

// 진행률 계산 (0-100)
export const getLevelProgress = (totalPerfects: number): number => {
  const currentLevel = getCurrentLevelInfo(totalPerfects);
  const nextLevel = getNextLevel(currentLevel.level);

  if (!nextLevel) return 100; // 최대 레벨

  const currentRequired = currentLevel.requiredPerfects;
  const nextRequired = nextLevel.requiredPerfects;
  const progress = ((totalPerfects - currentRequired) / (nextRequired - currentRequired)) * 100;

  return Math.min(Math.max(progress, 0), 100);
};

// 스테이지 전환 감지
export const detectStageTransition = (oldTotalPerfects: number, newTotalPerfects: number): AvatarStage | null => {
  const oldLevel = getCurrentLevelInfo(oldTotalPerfects);
  const newLevel = getCurrentLevelInfo(newTotalPerfects);

  // 스테이지가 변경되었고, 레벨이 더 높은 경우에만 전환으로 인정
  if (newLevel.stage !== oldLevel.stage && newLevel.level > oldLevel.level) {
    return newLevel.stage;
  }

  return null;
};

// 스테이지별 유물 애니메이션 타입 매핑
export const getStageTransitionRelicType = (stage: AvatarStage): 'confetti' | 'treasure' | 'sparkle' | 'medal' | 'levelup' => {
  switch (stage) {
    case 'sprout':
      return 'sparkle'; // 새싹 돋아남 - 반짝임
    case 'bud':
      return 'medal'; // 꽃봉오리 - 메달
    case 'bloom':
      return 'treasure'; // 꽃 - 보물 상자
    case 'master':
      return 'levelup'; // 마스터 - 레벨업 효과
    default:
      return 'confetti';
  }
};

