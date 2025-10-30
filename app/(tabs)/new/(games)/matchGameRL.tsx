import { Audio } from 'expo-av';
import React, { useContext, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MissionProgressIcon from '../../../../components/MissionProgressIcon';
import { ClearContext } from '../../../../context/ClearContext';
import { StarContext } from '../../../../context/StarContext';

// 소리 목록
const sounds = [
  { sound: require('../../../../assets/sounds/dog.mp3'), name: '개' },
  { sound: require('../../../../assets/sounds/cat.mp3'), name: '고양이' },
  { sound: require('../../../../assets/sounds/wolf.mp3'), name: '늑대' },
  { sound: require('../../../../assets/sounds/cock.mp3'), name: '닭' },
  { sound: require('../../../../assets/sounds/pig.mp3'), name: '돼지' },
  { sound: require('../../../../assets/sounds/horse.mp3'), name: '말' },
  { sound: require('../../../../assets/sounds/lion.mp3'), name: '사자' },
  { sound: require('../../../../assets/sounds/cow.mp3'), name: '소' },
  { sound: require('../../../../assets/sounds/goat.mp3'), name: '염소' },
  { sound: require('../../../../assets/sounds/duck.mp3'), name: '오리' },
  { sound: require('../../../../assets/sounds/monkey.mp3'), name: '원숭이' },
  { sound: require('../../../../assets/sounds/elephant.mp3'), name: '코끼리' }
];

const epsilon = 0.1; // ε-greedy 방식의 탐험 확률
const learningRate = 0.1; // 학습률
const discountFactor = 0.9; // 할인율

// *** FIX 1: Q-테이블의 타입을 명시적으로 정의합니다. ***
type QTable = {
  [state: string]: {
    [action: string]: number;
  };
};

export default function MatchGameRL() {
  const [playList, setPlayList] = useState<{ sound: Audio.Sound; name: string }[]>([]);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [disabledButtons, setDisabledButtons] = useState<Set<string>>(new Set());
  const [correctSoundNames, setCorrectSoundNames] = useState<Set<string>>(new Set());
  const [buttonColors, setButtonColors] = useState<{ [key: string]: string }>({});
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(1);
  const [maxChoices] = useState<number>(3);
  const [remainingChoices, setRemainingChoices] = useState<number>(maxChoices);
  // *** FIX 2: useState에 QTable 타입을 적용합니다. ***
  const [Q, setQ] = useState<QTable>({});
  const [hasLostChance, setHasLostChance] = useState<boolean>(false);

  const starContext = useContext(StarContext);
  const clearContext = useContext(ClearContext);

  // Q-테이블 초기화
  const initQTable = () => {
    // *** FIX 3: newQ 변수에도 QTable 타입을 적용합니다. ***
    const newQ: QTable = {};
    sounds.forEach(sound => {
      newQ[sound.name] = {};
      sounds.forEach(soundItem => {
        newQ[sound.name][soundItem.name] = 0;
      });
    });
    setQ(newQ);
  };

  // Q-값 업데이트
  const updateQValue = (state: string, action: string, reward: number) => {
    setQ(prevQ => {
      if (Object.keys(prevQ).length === 0 || !prevQ[state]) {
        return prevQ;
      }
      const newQ = JSON.parse(JSON.stringify(prevQ)) as QTable;
      const maxFutureReward = Math.max(...Object.values(newQ[state]));
      const oldQValue = newQ[state][action];
      newQ[state][action] = oldQValue + learningRate * (reward + discountFactor * maxFutureReward - oldQValue);
      return newQ;
    });
  };

  // 게임 시작 함수
  const startGame = async () => {
    if (currentDifficulty === 1) {
      setHasLostChance(false);
    }
    setButtonColors({});
    setDisabledButtons(new Set());
    setRemainingChoices(maxChoices);

    const soundList = [];
    for (const soundPath of sounds) {
      const { sound } = await Audio.Sound.createAsync(soundPath.sound);
      soundList.push({ sound, name: soundPath.name });
    }
    setPlayList(soundList);

    const numSounds = Math.min(currentDifficulty + 2, sounds.length);
    const randomSounds = getRandomElements(soundList, numSounds);
    
    for(const sound of randomSounds) {
        await sound.sound.playAsync();
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    const correctNames = new Set(randomSounds.map(sound => sound.name));
    setCorrectSoundNames(correctNames);
    setIsGameStarted(true);
    alert('소리 재생이 끝났습니다! 선택하세요.');
  };

  // 게임 종료 함수
  const endGame = async (isWin: boolean) => {
    if (isWin) {
      const newDifficulty = currentDifficulty + 1;
      if (currentDifficulty === 2 && newDifficulty === 3) {
        starContext?.addStar('matchGameRL');
        if (!hasLostChance) {
          clearContext?.markAsCleared('matchGameRL');
        }
      }
      setCurrentDifficulty(newDifficulty);
    }
    
    for (const soundObj of playList) {
      try {
        const status = await soundObj.sound.getStatusAsync();
        if (status.isLoaded) {
          await soundObj.sound.unloadAsync();
        }
      } catch (error) {
        // console.error(...)
      }
    }

    setIsGameStarted(false);
    setPlayList([]);
  };

  // 버튼 클릭 시 호출되는 함수
  const handleButtonPress = (soundName: string) => {
    if (disabledButtons.has(soundName) || remainingChoices <= 0) return;

    let newButtonColors = { ...buttonColors };
    const state = soundName;

    if (correctSoundNames.has(soundName)) {
      updateQValue(state, soundName, 1);
      
      const newDisabledButtons = new Set(disabledButtons).add(soundName);
      setDisabledButtons(newDisabledButtons);

      const newCorrectNames = new Set(correctSoundNames);
      newCorrectNames.delete(soundName);
      setCorrectSoundNames(newCorrectNames);

      newButtonColors[soundName] = 'green';

      if (newCorrectNames.size === 0) {
        alert('축하합니다! 모든 소리를 맞추셨습니다.');
        endGame(true);
      } else {
        alert('정답입니다! 다음 소리를 맞추세요.');
      }
    } else {
      updateQValue(state, soundName, -1);
      setHasLostChance(true);
      newButtonColors[soundName] = 'red';

      const newRemainingChoices = remainingChoices - 1;
      setRemainingChoices(newRemainingChoices);

      if (newRemainingChoices <= 0) {
        alert("선택 횟수가 0이 되어 게임이 종료됩니다.");
        endGame(false);
      } else {
        alert('틀렸습니다. 다시 시도하세요.');
      }
    }
    setButtonColors(newButtonColors);
  };

  // 배열에서 랜덤하게 요소를 선택하는 함수
  function getRandomElements(arr: any[], num: number): any[] {
    const result: any[] = [];
    const seenIndexes = new Set<number>();

    while (result.length < num) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      if (!seenIndexes.has(randomIndex)) {
        result.push(arr[randomIndex]);
        seenIndexes.add(randomIndex);
      }
    }
    return result;
  }

  useEffect(() => {
    initQTable();
    return () => {
      playList.forEach(async (soundObj) => {
        try {
          const status = await soundObj.sound.getStatusAsync();
          if (status.isLoaded) {
            await soundObj.sound.unloadAsync();
          }
        } catch (error) {
            // console.error(...)
        }
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      <MissionProgressIcon
        gameId="matchGameRL"
        title="강화학습 미션"
        missionText="난이도 3 도달하기"
        clearText="기회 소모 없이 난이도 3 도달"
        progressItems={[
          { label: '현재 난이도', value: currentDifficulty },
          { label: '이번 런 기회 소모', value: hasLostChance ? '있음' : '없음' }
        ]}
      />

      {!isGameStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.infoText}>현재 난이도: {currentDifficulty}</Text>
          <Button title="게임 시작" onPress={startGame} />
        </View>
      ) : (
        <View>
          <Text style={styles.infoText}>난이도: {currentDifficulty} | 남은 선택 횟수: {remainingChoices}</Text>
          {sounds.map((soundItem) => (
            <Button
              key={soundItem.name}
              title={soundItem.name}
              onPress={() => handleButtonPress(soundItem.name)}
              disabled={disabledButtons.has(soundItem.name) || remainingChoices <= 0}
              color={buttonColors[soundItem.name] || 'skyblue'}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});