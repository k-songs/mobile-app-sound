import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { InstrumentType } from '../../constants/drumSounds';
import { GameState } from '../../hooks/useGameLogic';

interface InstrumentDisplayProps {
  instrument: InstrumentType | null;
  gameState: GameState;
}

export function InstrumentDisplay({ instrument, gameState }: InstrumentDisplayProps) {
  if (!instrument) return null;

  const getInstructionText = () => {
    switch (gameState) {
      case 'ready':
        return '게임 시작 버튼을 눌러 소리를 들어보세요';
      case 'playing':
        return '🎵 소리를 집중해서 들어보세요...';
      case 'answered':
        return '🤔 어떤 악기 소리였을까요?';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.instrumentIcon}>
        <Text style={styles.instrumentEmoji}>🥁</Text>
      </View>
      <Text style={styles.instructionText}>{getInstructionText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
    minHeight: 200,
    justifyContent: 'center',
  },
  instrumentIcon: {
    backgroundColor: '#F5F5F5',
    borderRadius: 75,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,

  },
  instrumentEmoji: {
    fontSize: 64,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

