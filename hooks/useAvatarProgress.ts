import { useState } from 'react';
import { UserProgress, AvatarUtils } from '@/types/avatar';
import { useAsyncStorage } from './useAsyncStorage';

const STORAGE_KEY = '@hearing_training_progress';

/**
 * 🎭 아바타 진행도 관리 Hook
 * 
 * 기능:
 * - 사용자 진행도 저장/불러오기
 * - 레벨업 감지
 * - Perfect 누적
 */
export const useAvatarProgress = () => {
  const initialProgress: UserProgress = {
    currentLevel: 1,
    totalPerfects: 0,
    totalTrainingSessions: 0,
    consecutiveDays: 0,
    averageAccuracy: 0,
    lastTrainingDate: new Date().toISOString().split('T')[0],
  };

  const [progress, setProgress, loading, error] = useAsyncStorage<UserProgress>(
    STORAGE_KEY,
    initialProgress
  );
  const [isLeveledUp, setIsLeveledUp] = useState(false);
  const [newLevelInfo, setNewLevelInfo] = useState<ReturnType<typeof AvatarUtils.calculateCurrentLevel> | null>(null);

  // Perfect 추가 및 레벨 체크
  const addPerfects = (count: number, accuracy: number) => {
    const currentLevel = AvatarUtils.calculateCurrentLevel(progress.totalPerfects);
    const newTotalPerfects = progress.totalPerfects + count;
    const newLevel = AvatarUtils.calculateCurrentLevel(newTotalPerfects);

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = today !== progress.lastTrainingDate;

    const newProgress: UserProgress = {
      ...progress,
      totalPerfects: newTotalPerfects,
      totalTrainingSessions: progress.totalTrainingSessions + 1,
      consecutiveDays: isNewDay ? progress.consecutiveDays + 1 : progress.consecutiveDays,
      averageAccuracy: (progress.averageAccuracy * progress.totalTrainingSessions + accuracy) / (progress.totalTrainingSessions + 1),
      lastTrainingDate: today,
      currentLevel: newLevel.level,
    };

    setProgress(newProgress);

    // 레벨업 체크
    if (newLevel.level > currentLevel.level) {
      setNewLevelInfo(newLevel);
      setIsLeveledUp(true);
      console.log(`🎊 레벨업! ${currentLevel.name} → ${newLevel.name}`);
    }
  };

  // 레벨업 모달 닫기
  const closeLevelUpModal = () => {
    setIsLeveledUp(false);
  };

  // 현재 레벨 정보
  const currentLevelInfo = AvatarUtils.calculateCurrentLevel(progress.totalPerfects);
  const nextLevelInfo = AvatarUtils.getNextLevel(currentLevelInfo.level);
  const levelProgress = AvatarUtils.calculateLevelProgress(progress.totalPerfects).progressPercentage;

  return {
    progress,
    currentLevelInfo,
    nextLevelInfo,
    levelProgress,
    isLeveledUp,
    newLevelInfo,
    addPerfects,
    closeLevelUpModal,
    loading,
    error,
  };
};

