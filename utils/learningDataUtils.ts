
import { GameConfig } from '@/constants/GameConfig';
import { 
  TrainingMode, 
  DifficultyLevel, 
  GameResult 
} from '@/types/game';
import { UserProgress } from '@/types/avatar';

// 🧠 학습 데이터 유틸리티
export const LearningDataUtils = {
  // 🎯 훈련 모드별 점수 계산
  calculateModeScore: (
    mode: TrainingMode, 
    gameResult: GameResult, 
    difficulty: DifficultyLevel
  ) => {
    const baseModeMultipliers = {
      'sound-catch': 1.2,
      'hearing-threshold': 1.5,
      'balance-test': 1.3
    };

    const difficultyMultipliers = {
      'easy': 0.8,
      'normal': 1.0,
      'hard': 1.2
    };

    const modeMultiplier = baseModeMultipliers[mode] || 1;
    const difficultyMultiplier = difficultyMultipliers[difficulty];

    return Math.round(
      gameResult.totalScore * 
      modeMultiplier * 
      difficultyMultiplier
    );
  },

  // 📊 학습 진행 상태 업데이트
  updateLearningProgress: (
    currentProgress: UserProgress, 
    gameResult: GameResult
  ): UserProgress => ({
    ...currentProgress,
    totalPerfects: currentProgress.totalPerfects + gameResult.perfectCount,
    totalTrainingSessions: currentProgress.totalTrainingSessions + 1,
    consecutiveDays: 
      currentProgress.lastTrainingDate === new Date().toISOString().split('T')[0]
        ? currentProgress.consecutiveDays
        : currentProgress.consecutiveDays + 1,
    lastTrainingDate: new Date().toISOString().split('T')[0]
  }),

  // 🏆 성과 분석
  analyzePerformance: (gameResults: GameResult[]) => {
    if (gameResults.length === 0) return null;

    const totalResults = gameResults.reduce((acc, result) => ({
      totalPerfects: acc.totalPerfects + result.perfectCount,
      totalGood: acc.totalGood + result.goodCount,
      totalMiss: acc.totalMiss + result.missCount,
      totalScore: acc.totalScore + result.totalScore,
      maxCombos: Math.max(acc.maxCombos, result.maxCombo)
    }), {
      totalPerfects: 0,
      totalGood: 0,
      totalMiss: 0,
      totalScore: 0,
      maxCombos: 0
    });

    return {
      ...totalResults,
      averageAccuracy: Math.round(
        ((totalResults.totalPerfects + totalResults.totalGood) / 
        (totalResults.totalPerfects + totalResults.totalGood + totalResults.totalMiss)) * 100
      ),
      averageScore: Math.round(totalResults.totalScore / gameResults.length)
    };
  },

  // 🔍 특정 조건의 게임 결과 필터링
  filterGameResults: (
    gameResults: GameResult[], 
    predicate: (result: GameResult) => boolean
  ): GameResult[] => gameResults.filter(predicate),

  // 📈 학습 추세 분석
  analyzeLearningTrend: (gameResults: GameResult[]) => {
    if (gameResults.length < 2) return null;

    const perfectRates = gameResults.map(
      result => (result.perfectCount / (result.perfectCount + result.goodCount + result.missCount)) * 100
    );

    return {
      trend: perfectRates[perfectRates.length - 1] > perfectRates[0] ? 'improving' : 'declining',
      averagePerfectRate: Math.round(
        perfectRates.reduce((a, b) => a + b, 0) / perfectRates.length
      )
    };
  }
};
