import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/GlobalStyles';

interface DifficultyScreenProps {
  onSelectDifficulty: (difficulty: number) => void;
}

function DifficultyScreen({ onSelectDifficulty }: DifficultyScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>난이도 선택</Text>

      <View style={[styles.card, styles.card]}>
        <Text style={[styles.instructionText, styles.instruction]}>
          게임 난이도를 선택해주세요
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => onSelectDifficulty(2)}
            style={[styles.primaryButton, styles.button]}
          >
            <Text style={styles.buttonText}>초급 (2가지 악기)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSelectDifficulty(4)}
            style={[styles.primaryButton, styles.button]}
          >
            <Text style={styles.buttonText}>중급 (4가지 악기)</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontFamily: 'open-sans-bold',
    fontSize: 24,
    color: Colors.accent.main,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.main,
    padding: 12,
    marginBottom: 30,
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 36,
    padding: 16,
    backgroundColor: Colors.primary.darkest,
    borderRadius: 8,
    elevation: 4,
  },
  instructionText: {
    fontFamily: 'open-sans',
    fontSize: 24,
    color: Colors.accent.main,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 30,
  },
  primaryButton: {
    borderRadius: 28,
    margin: 4,
    overflow: "hidden",
    marginBottom: 4,
    backgroundColor: Colors.primary.main,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'open-sans-bold',
    textAlign: "center",
  },
});

export default DifficultyScreen;