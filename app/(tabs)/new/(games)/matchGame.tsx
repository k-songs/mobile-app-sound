// [수정] useContext를 사용하기 위해 import 목록에 추가합니다.
import { Audio } from 'expo-av';
import React, { useContext, useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

// [추가] 새로 만든 컴포넌트와 컨텍스트를 import 합니다.
import MissionProgressIcon from '../../../../components/MissionProgressIcon';
import { ClearContext } from '../../../../context/ClearContext';
import { StarContext } from '../../../../context/StarContext';


const sounds = [
  { sound: require('../../../../assets/sounds/개.mp3'), name: '개' },
  { sound: require('../../../../assets/sounds/고양이.mp3'), name: '고양이' },
  { sound: require('../../../../assets/sounds/늑대.mp3'), name: '늑대' },
  { sound: require('../../../../assets/sounds/닭.mp3'), name: '닭' },
  { sound: require('../../../../assets/sounds/돼지.mp3'), name: '돼지' },
  { sound: require('../../../../assets/sounds/말.mp3'), name: '말' },
  { sound: require('../../../../assets/sounds/사자.mp3'), name: '사자' },
  { sound: require('../../../../assets/sounds/소.mp3'), name: '소' },
  { sound: require('../../../../assets/sounds/염소.mp3'), name: '염소' },
  { sound: require('../../../../assets/sounds/오리.mp3'), name: '오리' },
  { sound: require('../../../../assets/sounds/원숭이.mp3'), name: '원숭이' },
  { sound: require('../../../../assets/sounds/코끼리.mp3'), name: '코끼리' }
];

export default function MatchGame() {
  const [playList, setPlayList] = useState<{ sound: Audio.Sound; name: string }[]>([]);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [disabledButtons, setDisabledButtons] = useState<Set<string>>(new Set());
  const [correctSoundNames, setCorrectSoundNames] = useState<Set<string>>(new Set());
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState<number>(0);
  const [buttonColors, setButtonColors] = useState<{ [key: string]: string }>({});

  // ====[ 미션 추가 1: 미션 달성을 위한 상태 변수 추가 ]====
  const [madeMistake, setMadeMistake] = useState<boolean>(false);
  const starContext = useContext(StarContext);
  const clearContext = useContext(ClearContext);
  // =======================================================

  const startGame = async () => {
    // ====[ 미션 추가 2: 게임 시작 시 미션 상태 초기화 ]====
    setMadeMistake(false);
    // =======================================================

    // --- (이하 원본 코드와 동일) ---
    const soundList = [];
    for (const soundPath of sounds) {
      const { sound } = await Audio.Sound.createAsync(soundPath.sound);
      soundList.push({ sound, name: soundPath.name });
    }

    const shuffledList = shuffleArray(soundList);
    setPlayList(shuffledList);

    const randomSounds = getRandomElements(shuffledList, 3);
    await randomSounds[0].sound.playAsync();
    await randomSounds[1].sound.playAsync();
    await randomSounds[2].sound.playAsync();

    const correctNames = new Set(randomSounds.map(sound => sound.name));
    setCorrectSoundNames(correctNames);

    setIsGameStarted(true);
    alert('소리 재생이 끝났습니다! 선택하세요.');
  };

  const endGame = async () => {
    // --- (이하 원본 코드와 동일) ---
    for (const soundObj of playList) {
      const { sound } = soundObj;
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.unloadAsync();
          console.log(`${soundObj.name} 언로드 완료`);
        } else {
          console.log(`${soundObj.name} 로딩 안됨`);
        }
      } catch (error) {
        console.error(`${soundObj.name} 언로드 오류: `, error);
      }
    }

    setIsGameStarted(false);
    setPlayList([]);
    setDisabledButtons(new Set());
    setCorrectSoundNames(new Set());
    setTotalCorrectAnswers(0);
  };

  const handleButtonPress = (soundName: string) => {
    if (disabledButtons.has(soundName)) return;

    let newButtonColors = { ...buttonColors };

    if (correctSoundNames.has(soundName)) {
      // --- (정답 로직은 원본 코드와 동일) ---
      setDisabledButtons(prev => new Set(prev).add(soundName));
      setCorrectSoundNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(soundName);
        return newSet;
      });
      setTotalCorrectAnswers(prev => prev + 1);
      newButtonColors[soundName] = 'green';

      if (correctSoundNames.size === 1) {
        alert('축하합니다! 모든 소리를 맞추셨습니다.');
        // ====[ 미션 추가 3: 클리어 시 조건 확인 및 보상 ]====
        starContext?.addStar('matchGame');

        if (!madeMistake) {
          clearContext?.markAsCleared('matchGame');
        }
        // =======================================================
        endGame();
      } else {
        alert('정답입니다! 다음 소리를 맞추세요.');
      }
    } else {
      // ====[ 미션 추가 4: 실수 기록 ]====
      setMadeMistake(true);
      // ===================================

      // --- (오답 로직은 원본 코드와 동일) ---
      newButtonColors[soundName] = 'red';
      alert('틀렸습니다. 다시 시도하세요.');
    }

    setButtonColors(newButtonColors);
  };

  // --- (이하 헬퍼 함수 및 useEffect, return 문 모두 원본 코드와 동일) ---

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

  const shuffleArray = (array: any[]) => {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getButtonStyle = (soundName: string) => {
    if (correctSoundNames.has(soundName)) {
      return { backgroundColor: 'green' };
    }
    return { backgroundColor: 'skyblue' };
  };

  useEffect(() => {
    return () => {
      playList.forEach(async (soundObj) => {
        const { sound } = soundObj;
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.unloadAsync();
            console.log(`${soundObj.name} 언로드 완료`);
          }
        } catch (error) {
          console.error(`${soundObj.name} 언로드 오류: `, error);
        }
      });
    };
  }, [playList]);

  return (
    <View style={styles.container}>
      <MissionProgressIcon
        gameId="matchGame"
        title="소리 맞추기 미션"
        missionText="정답 맞추기"
        clearText="한 번도 틀리지 않고 정답 맞추기"
        progressItems={[
          { label: '이번 판 실수 여부', value: madeMistake ? '있음' : '없음' }
        ]}
      />
      
      {!isGameStarted ? (
        <Button title="게임시작" onPress={startGame} />
      ) : (
        <View>
          {sounds.map((soundItem) => (
            <Button
              key={soundItem.name}
              title={soundItem.name}
              onPress={() => handleButtonPress(soundItem.name)}
              disabled={disabledButtons.has(soundItem.name)}
              color={getButtonStyle(soundItem.name).backgroundColor}
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
});