import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ActivityIndicator,
  TouchableOpacity  
} from 'react-native';

import { useGameLogic } from '@/hooks/useGameLogic';
import { useAudioPlayer } from '@/hooks';  

import Title from '../components/ui/Title';
import Card from '../components/ui/Card';
import InstructionText from '../components/ui/InstructionText';
import PrimaryButton from '../components/ui/PrimaryButton';
import Colors from '@/constants/Colors'; 
import { DRUM_INSTRUMENTS, DifficultyType } from '@/constants/drumSounds';

interface DrumGameScreenProps {
  difficulty?: DifficultyType;
  onGameOver: (score: number, maxScore: number) => void;
  onCorrectAnswer?: () => void;
}

function DrumGameScreen({ difficulty = 'intermediate', onGameOver, onCorrectAnswer }: DrumGameScreenProps) {
  
  const {
    currentInstrument,
    choices,
    gameState,
    score,
    round,
    showFeedback,
    feedbackMessage,
    maxRounds,
    startNewRound,
    handleAnswer,
    resetGame,
    startPlaying,
    setAnswered,
  } = useGameLogic({ 
    difficulty, 
    onGameComplete: (score, maxScore, percentage) => onGameOver(score, maxScore)
  });

  
  const { playSound, isPlaying } = useAudioPlayer();

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  
  const handlePlaySound = async () => {
    if (!currentInstrument) return;
    
    startPlaying();
    await playSound(currentInstrument, () => {
      setAnswered();
    });
  };

  return (
    <View style={styles.container}>
      <Title>악기 맞히기 게임</Title>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          라운드: {round}/{maxRounds} | 점수: {score}
        </Text>
      </View>

      <Card style={styles.gameCard}>
        {/* 애니메이션 영역 */}
        <View style={styles.animationContainer}>
          <View style={styles.placeholderAnimation}>
            <Text style={styles.placeholderText}>🥁</Text>
            <InstructionText>재생 버튼을 눌러주세요</InstructionText>
          </View>
        </View>

      
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

    
        <View style={styles.playButtonContainer}>
          <PrimaryButton 
            onPress={handlePlaySound}
            disabled={isPlaying || gameState === 'waitingForNextRound'}
            style={[styles.playButton, isPlaying && styles.disabledButton]}
          >
            {isPlaying ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>🔊 소리 재생</Text>
            )}
          </PrimaryButton>
        </View>

        {/* 선택지 버튼들 */}
        {gameState === 'answered' && (
          <View style={styles.choicesContainer}>
            <InstructionText style={styles.choiceInstruction}>
              어떤 악기 소리였을까요?
            </InstructionText>
            <View style={styles.choiceButtons}>
              {choices.map((instrument) => (
                <TouchableOpacity
                  key={instrument}
                  style={styles.choiceButton}
                  onPress={() => handleAnswer(instrument)}
                >
                  <Text style={styles.choiceButtonText}>
                    {DRUM_INSTRUMENTS[instrument].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* 게임 리셋 버튼 */}
      <View style={styles.resetContainer}>
        <PrimaryButton onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.buttonText}>다시 시작</Text>
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontFamily: 'open-sans-bold',
    color: Colors.primary800,
  },
  gameCard: {
    marginBottom: 20,
  },
  animationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderAnimation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 10,
  },
  playButtonContainer: {
    marginBottom: 20,
  },
  playButton: {
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  choicesContainer: {
    marginTop: 20,
  },
  choiceInstruction: {
    textAlign: 'center',
    marginBottom: 15,
  },
  choiceButtons: {
    gap: 10,
  },
  choiceButton: {
    backgroundColor: Colors.primary600,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  choiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'open-sans-bold',
  },
  resetContainer: {
    marginTop: 20,
  },
  resetButton: {
    marginHorizontal: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'open-sans-bold',
  },
  feedbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 50,
  },
  feedbackText: {
    fontSize: 22,
    fontFamily: 'open-sans-bold',
    color: Colors.primary800,
    textAlign: 'center',
  },
});

export default DrumGameScreen;