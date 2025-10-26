/**
 * 🎭 아바타 시스템 타입 정의
 */

import { GenericState, ArrayUtils, ObjectUtils } from './common';
import { GameResult } from './game';

// 🏆 아바타 레벨 인터페이스
export interface AvatarLevel {
  level: number;
  name: string;
  requiredPerfects: number;
  rewards: string[];
  icon: string;
  color: string;
  emoji: string;
  description: string;
}

// 🎨 아바타 스타일 인터페이스
export interface AvatarStyle {
  baseColor: string;
  accentColor: string;
  backgroundPattern: string;
}

// 📊 사용자 진행 상태 인터페이스
export interface UserProgress {
  totalPerfects: number;
  currentLevel: number;
  totalTrainingSessions: number;
  consecutiveDays: number;
  averageAccuracy: number;
  lastTrainingDate: string;
}

// 🏅 아바타 보상 인터페이스
export interface AvatarReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// 🧩 아바타 상태 타입
export type AvatarStateType = GenericState<{
  progress: UserProgress;
  currentStyle: AvatarStyle;
  unlockedRewards: AvatarReward[];
}>;

// 🌟 레벨 설정 상수
export const AVATAR_LEVELS: AvatarLevel[] = [
  {
    level: 1,
    name: '초보자',
    requiredPerfects: 30,
    rewards: ['기본 아바타'],
    icon: '🥉',
    color: '#A8E6CF',
    emoji: '🌱',
    description: '청각 훈련을 막 시작했어요'
  },
  {
    level: 2,
    name: '학습자',
    requiredPerfects: 100,
    rewards: ['색상 변경 권한'],
    icon: '🥈',
    color: '#8FD9A8',
    emoji: '🌿',
    description: '꾸준히 훈련하고 있어요'
  },
  {
    level: 3,
    name: '숙련자',
    requiredPerfects: 200,
    rewards: ['특별 배경'],
    icon: '🥇',
    color: '#76C893',
    emoji: '🌺',
    description: '소리를 감지하기 시작했어요'
  },
  {
    level: 4,
    name: '전문가',
    requiredPerfects: 350,
    rewards: ['고급 아바타'],
    icon: '🏆',
    color: '#52B788',
    emoji: '🌸',
    description: '청각이 점점 발달하고 있어요'
  },
  {
    level: 5,
    name: '마스터',
    requiredPerfects: 500,
    rewards: ['레전드 아바타'],
    icon: '🌟',
    color: '#FFD700',
    emoji: '✨',
    description: '청각 마스터의 경지'
  }
];

// 🛠️ 아바타 유틸리티 함수들
export const AvatarUtils = {
  // 현재 레벨 계산
  calculateCurrentLevel: (totalPerfects: number): AvatarLevel =>
    ArrayUtils.findLast(AVATAR_LEVELS, level =>
      totalPerfects >= level.requiredPerfects
    ) || AVATAR_LEVELS[0],

  // 다음 레벨까지 남은 퍼펙트 수 계산
  calculateLevelProgress: (totalPerfects: number) => {
    const currentLevel = AvatarUtils.calculateCurrentLevel(totalPerfects);
    const nextLevel = AVATAR_LEVELS[currentLevel.level] || null;

    return {
      currentLevel,
      nextLevel,
      currentPerfects: totalPerfects,
      requiredPerfects: nextLevel ? nextLevel.requiredPerfects : null,
      progressPercentage: nextLevel
        ? (totalPerfects / nextLevel.requiredPerfects) * 100
        : 100
    };
  },

  // 다음 레벨 정보 반환
  getNextLevel: (currentLevelNumber: number): AvatarLevel | null => {
    return AVATAR_LEVELS[currentLevelNumber] || null;
  },

  // 보상 필터링 (string 타입)
  filterRewards: (
    predicate: (reward: string) => boolean
  ): string[] =>
    AVATAR_LEVELS
      .flatMap(level => level.rewards)
      .filter(predicate),

  // 게임 결과로부터 진행 상태 업데이트
  updateProgressFromGameResult: (
    currentProgress: UserProgress,
    gameResult: GameResult
  ): UserProgress => ({
    ...currentProgress,
    totalPerfects: currentProgress.totalPerfects + gameResult.perfectCount,
    totalTrainingSessions: currentProgress.totalTrainingSessions + 1,
    consecutiveDays: currentProgress.lastTrainingDate === new Date().toISOString().split('T')[0]
      ? currentProgress.consecutiveDays
      : currentProgress.consecutiveDays + 1,
    lastTrainingDate: new Date().toISOString().split('T')[0]
  })
};

// 🔍 레벨 정보 유틸리티 함수 추가
export const getCurrentLevelInfo = (totalPerfects: number) => 
  AvatarUtils.calculateCurrentLevel(totalPerfects);

export const getLevelProgress = (totalPerfects: number) => 
  AvatarUtils.calculateLevelProgress(totalPerfects);

export const getNextLevel = (currentLevel: number) => 
  AvatarUtils.getNextLevel(currentLevel);

