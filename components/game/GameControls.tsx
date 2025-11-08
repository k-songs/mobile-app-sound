import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface GameControlsProps {
  type: 'start' | 'play' | 'reset';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GameControls({ type, onPress, disabled = false, loading = false }: GameControlsProps) {
  const getButtonConfig = () => {
    switch (type) {
      case 'start':
        return {
          text: '🎵 게임 시작',
          style: styles.startButton,
          textStyle: styles.startButtonText,
        };
      case 'play':
        return {
          text: '🔊 다시 듣기',
          style: styles.playButton,
          textStyle: styles.playButtonText,
        };
      case 'reset':
        return {
          text: '🔄 게임 다시 시작',
          style: styles.resetButton,
          textStyle: styles.resetButtonText,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity 
      style={[config.style, disabled && styles.disabledButton]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={config.textStyle}>{config.text}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    elevation: 4,
    minHeight: 60,
  },
  playButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3,
    minHeight: 55,
  },
  resetButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    minHeight: 50,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

