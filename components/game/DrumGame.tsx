import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { InstrumentDisplay } from './InstrumentDisplay';
import { ChoiceButtons } from './ChoiceButtons';
import { GameControls } from './GameControls';
import { DifficultyType } from '../../constants/drumSounds';

interface DrumGameProps {
  difficulty?: DifficultyType;
  onGameComplete?: (score: number, maxScore: number, percentage: number) => void;
}

export function DrumGame({ difficulty = 'beginner', onGameComplete }: DrumGameProps) {
  const gameLogic = useGameLogic({ difficulty, onGameComplete });
  const audioPlayer = useAudioPlayer();

  const {
    currentInstrument,
    choices,
    gameState,
    score,
    round,
    showFeedback,
    feedbackMessage,
    currentDifficulty,
    maxRounds,
    startNewRound,
    handleAnswer,
    resetGame,
    startPlaying,
    setAnswered,
  } = gameLogic;

  // 컴포넌트 마운트 시 게임 초기화
  useEffect(() => {
    startNewRound();
  }, []);

  const handleStartGame = async () => {
    startPlaying();
    if (currentInstrument) {
      await audioPlayer.playSound(currentInstrument, () => {
        setAnswered();
      });
    }
  };

  const handleReplaySound = async () => {
    if (currentInstrument) {
      await audioPlayer.stopSound();
      await audioPlayer.playSound(currentInstrument, () => {
        setAnswered();
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>드럼 소리 맞히기</Text>
        <Text style={styles.difficulty}>
          {currentDifficulty.name} - {currentDifficulty.description}
        </Text>
      </View>

      {/* 점수 표시 */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          라운드: {round}/{maxRounds} | 점수: {score}
        </Text>
        <Text style={styles.percentageText}>
          정답률: {Math.round((score / Math.max(round - 1, 1)) * 100)}%
        </Text>
      </View>

      {/* 게임 영역 */}
      <View style={styles.gameArea}>
        {/* 시작 버튼 */}
        {gameState === 'ready' && (
          <GameControls 
            type="start" 
            onPress={handleStartGame} 
            disabled={audioPlayer.isPlaying}
          />
        )}

        {/* 악기 표시 */}
        <InstrumentDisplay instrument={currentInstrument} gameState={gameState} />

        {/* 피드백 메시지 */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* 다시 듣기 버튼 */}
        {gameState === 'playing' && !audioPlayer.isPlaying && (
          <GameControls 
            type="play" 
            onPress={handleReplaySound}
          />
        )}

        {/* 선택지 */}
        {gameState === 'answered' && !showFeedback && (
          <ChoiceButtons choices={choices} onSelect={handleAnswer} />
        )}
      </View>

      {/* 게임 리셋 버튼 */}
      <GameControls type="reset" onPress={resetGame} />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  percentageText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  gameArea: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    minHeight: 300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  feedbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 50,
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  devInfo: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  devInfoText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default DrumGame;
