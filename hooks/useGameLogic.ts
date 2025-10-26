import { useState, useCallback } from 'react';
import { QuestionCount, DifficultyLevel, SoundSpeed, GameResult, MAX_SETS, SOUND_SPEED_CONFIG } from '@/types/game';
import { useAvatarProgress } from './useAvatarProgress';

export interface GameSettings {
    questionCount: QuestionCount;
    difficulty: string;
    soundSpeed: string;
    trainingMode: string;
}

export interface GameState {
    gameStarted: boolean;
    currentQuestion: number;
    score: number;
    perfectCount: number;
    goodCount: number;
    missCount: number;
    currentSet: number;
    maxCombo: number;
    combo: number;
}

export interface UseGameLogicReturn {
    // Settings
    settings: GameSettings;
    setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
    showSettings: boolean;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;

    // Game State
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;

    // Avatar Progress
    avatarProgress: ReturnType<typeof useAvatarProgress>['progress'];
    currentLevelInfo: ReturnType<typeof useAvatarProgress>['currentLevelInfo'];
    nextLevelInfo: ReturnType<typeof useAvatarProgress>['nextLevelInfo'];
    levelProgress: ReturnType<typeof useAvatarProgress>['levelProgress'];
    isLeveledUp: ReturnType<typeof useAvatarProgress>['isLeveledUp'];
    newLevelInfo: ReturnType<typeof useAvatarProgress>['newLevelInfo'];
    addPerfects: ReturnType<typeof useAvatarProgress>['addPerfects'];
    closeLevelUpModal: ReturnType<typeof useAvatarProgress>['closeLevelUpModal'];

    // Game Actions
    startGame: () => void;
    finishSet: (result: GameResult, showResult?: boolean) => void;
    continueGame: () => void;
    resetGame: () => void;

    // Game State Updates
    updateScore: (points: number) => void;
    updateCombo: (isCorrect: boolean) => void;
    updateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const useGameLogic = (initialSettings: GameSettings): UseGameLogicReturn => {
    const [settings, setSettings] = useState<GameSettings>(initialSettings);
    const [showSettings, setShowSettings] = useState(false);

    const [gameState, setGameState] = useState<GameState>({
        gameStarted: false,
        currentQuestion: 0,
        score: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0,
        currentSet: 1,
        maxCombo: 0,
        combo: 0,
    });

    // Avatar Progress Hook
    const avatarProgressData = useAvatarProgress();

    // Game Actions
    const startGame = useCallback(() => {
        setGameState(prev => ({ ...prev, gameStarted: true }));
    }, []);

    const finishSet = useCallback((result: GameResult, showResult: boolean = true) => {
        // 아바타 진행도 업데이트
        const accuracy = (result.perfectCount / result.totalQuestions) * 100;
        avatarProgressData.addPerfects(result.perfectCount, accuracy);

        if (showResult) {
            // 결과 표시 로직
            console.log('게임 완료:', result);
        }

        setGameState(prev => ({
            ...prev,
            gameStarted: false,
            currentQuestion: 0,
            score: 0,
            perfectCount: 0,
            goodCount: 0,
            missCount: 0,
            currentSet: prev.currentSet + 1,
        }));
    }, [avatarProgressData]);

    const continueGame = useCallback(() => {
        startGame();
    }, [startGame]);

    const resetGame = useCallback(() => {
        setGameState({
            gameStarted: false,
            currentQuestion: 0,
            score: 0,
            perfectCount: 0,
            goodCount: 0,
            missCount: 0,
            currentSet: 1,
            maxCombo: 0,
            combo: 0,
        });
    }, []);

    // Game State Updates
    const updateScore = useCallback((points: number) => {
        setGameState(prev => ({
            ...prev,
            score: prev.score + points,
            currentQuestion: prev.currentQuestion + 1
        }));
    }, []);

    const updateCombo = useCallback((isCorrect: boolean) => {
        setGameState(prev => {
            const newCombo = isCorrect ? prev.combo + 1 : 0;
            const newMaxCombo = isCorrect && newCombo > prev.maxCombo ? newCombo : prev.maxCombo;

            return {
                ...prev,
                combo: newCombo,
                maxCombo: newMaxCombo,
                perfectCount: isCorrect ? prev.perfectCount + 1 : prev.perfectCount,
                missCount: isCorrect ? prev.missCount : prev.missCount + 1,
            };
        });
    }, []);

    const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    return {
        // Settings
        settings,
        setSettings,
        showSettings,
        setShowSettings,

        // Game State
        gameState,
        setGameState,

        // Avatar Progress
        avatarProgress: avatarProgressData.progress,
        currentLevelInfo: avatarProgressData.currentLevelInfo,
        nextLevelInfo: avatarProgressData.nextLevelInfo,
        levelProgress: avatarProgressData.levelProgress,
        isLeveledUp: avatarProgressData.isLeveledUp,
        newLevelInfo: avatarProgressData.newLevelInfo,
        addPerfects: avatarProgressData.addPerfects,
        closeLevelUpModal: avatarProgressData.closeLevelUpModal,

        // Game Actions
        startGame,
        finishSet,
        continueGame,
        resetGame,

        // Game State Updates
        updateScore,
        updateCombo,
        updateSettings,
    };
};

export default useGameLogic;
