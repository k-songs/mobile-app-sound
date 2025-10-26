import { useState, useCallback } from 'react';
import { DIFFICULTY_LEVELS, DRUM_INSTRUMENTS, InstrumentType, DifficultyType } from '../constants/drumSounds';

export type GameState = 'ready' | 'playing' | 'answered' | 'waitingForNextRound';

interface UseGameLogicProps {
  difficulty: DifficultyType;
  onGameComplete?: (score: number, maxScore: number, percentage: number) => void;
}

export function useGameLogic({ difficulty, onGameComplete }: UseGameLogicProps) {
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType | null>(null);
  const [choices, setChoices] = useState<InstrumentType[]>([]);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
  const availableInstruments = currentDifficulty.instruments;
  const maxRounds = currentDifficulty.rounds;

  const startNewRound = useCallback(() => {
    // 정답 악기 랜덤 선택
    const correctInstrument =
      availableInstruments[Math.floor(Math.random() * availableInstruments.length)];
    setCurrentInstrument(correctInstrument);

    // 오답 선택지 생성
    const wrongChoices = availableInstruments
      .filter((inst) => inst !== correctInstrument)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2); // 2개의 오답

    // 전체 선택지 섞기
    const allChoices = [correctInstrument, ...wrongChoices].sort(
      () => 0.5 - Math.random()
    );

    setChoices(allChoices);
    setGameState('ready');
  }, [availableInstruments]);

  const handleAnswer = useCallback(
    (selectedInstrument: InstrumentType) => {
      if (gameState !== 'answered') {
        return;
      }

      const isCorrect = selectedInstrument === currentInstrument;
      let newScore = score;

      if (isCorrect) {
        newScore = score + 1;
        setScore(newScore);
        setFeedbackMessage('정답! 🎉 잘하셨습니다!');
        setShowFeedback(true);
      } else {
        setFeedbackMessage(
          `오답! 정답은 "${DRUM_INSTRUMENTS[currentInstrument!].name}"입니다.`
        );
        setShowFeedback(true);
      }

      setGameState('waitingForNextRound');

      setTimeout(() => {
        setShowFeedback(false);
        if (round >= maxRounds) {
          onGameComplete?.(newScore, maxRounds, Math.round((newScore / maxRounds) * 100));
        } else {
          setRound((prevRound) => prevRound + 1);
          startNewRound();
        }
      }, 1000);
    },
    [gameState, currentInstrument, score, round, maxRounds, onGameComplete, startNewRound]
  );

  const resetGame = useCallback(() => {
    setScore(0);
    setRound(1);
    startNewRound();
  }, [startNewRound]);

  const startPlaying = useCallback(() => {
    setGameState('playing');
  }, []);

  const setAnswered = useCallback(() => {
    setGameState('answered');
  }, []);

  return {
    // State
    currentInstrument,
    choices,
    gameState,
    score,
    round,
    showFeedback,
    feedbackMessage,
    currentDifficulty,
    maxRounds,
    
    // Actions
    startNewRound,
    handleAnswer,
    resetGame,
    startPlaying,
    setAnswered,
  };
}
