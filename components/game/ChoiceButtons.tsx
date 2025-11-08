import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DRUM_INSTRUMENTS, InstrumentType } from '../../constants/drumSounds';

interface ChoiceButtonsProps {
  choices: InstrumentType[];
  onSelect: (instrument: InstrumentType) => void;
}

export function ChoiceButtons({ choices, onSelect }: ChoiceButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>답을 선택하세요:</Text>
      <View style={styles.buttonsGrid}>
        {choices.map((instrument) => (
          <TouchableOpacity
            key={instrument}
            style={styles.button}
            onPress={() => onSelect(instrument)}
            activeOpacity={0.7}
          >
            <View style={styles.instrumentIcon}>
              <Text style={styles.instrumentEmoji}>🥁</Text>
            </View>
            <Text style={styles.buttonText}>
              {DRUM_INSTRUMENTS[instrument].name}
            </Text>
            <Text style={styles.description}>
              {DRUM_INSTRUMENTS[instrument].description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
    maxWidth: '48%',
    minHeight: 120,
    elevation: 3,
  },
  instrumentIcon: {
    marginBottom: 8,
  },
  instrumentEmoji: {
    fontSize: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    color: '#E8F5E8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
});

