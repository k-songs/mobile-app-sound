import { Audio } from 'expo-av';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Button,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MissionProgressIcon from '../../../../components/MissionProgressIcon';
import { ClearContext } from '../../../../context/ClearContext';
import { StarContext } from '../../../../context/StarContext';

const sounds = [
  { sound: require('../../../../assets/sounds/개.mp3'), image: require('../../../../assets/images/개.png'), name: '개' },
  { sound: require('../../../../assets/sounds/고양이.mp3'), image: require('../../../../assets/images/고양이.png'), name: '고양이' },
  { sound: require('../../../../assets/sounds/늑대.mp3'), image: require('../../../../assets/images/늑대.png'), name: '늑대' },
  { sound: require('../../../../assets/sounds/닭.mp3'), image: require('../../../../assets/images/닭.png'), name: '닭' },
  { sound: require('../../../../assets/sounds/돼지.mp3'), image: require('../../../../assets/images/돼지.png'), name: '돼지' },
  { sound: require('../../../../assets/sounds/말.mp3'), image: require('../../../../assets/images/말.png'), name: '말' },
  { sound: require('../../../../assets/sounds/사자.mp3'), image: require('../../../../assets/images/사자.png'), name: '사자' },
  { sound: require('../../../../assets/sounds/소.mp3'), image: require('../../../../assets/images/소.png'), name: '소' },
  { sound: require('../../../../assets/sounds/염소.mp3'), image: require('../../../../assets/images/염소.png'), name: '염소' },
  { sound: require('../../../../assets/sounds/오리.mp3'), image: require('../../../../assets/images/오리.png'), name: '오리' },
  { sound: require('../../../../assets/sounds/원숭이.mp3'), image: require('../../../../assets/images/원숭이.png'), name: '원숭이' },
  { sound: require('../../../../assets/sounds/코끼리.mp3'), image: require('../../../../assets/images/코끼리.png'), name: '코끼리' },
];

export default function OrderGame() {
  const [playList, setPlayList] = useState<{ sound: Audio.Sound; name: string }[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [correctSoundNames, setCorrectSoundNames] = useState<(string)[]>([]);
  const [dropZonesLayout, setDropZonesLayout] = useState<any[]>([]);
  const [droppedImages, setDroppedImages] = useState<(string | null)[]>([null, null, null]);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const dropZoneRefs = useRef<(View | null)[]>([]);

  const starContext = useContext(StarContext);
  const clearContext = useContext(ClearContext);

  const DraggableImage = ({
    image,
    index,
    name,
    onDrop,
    disabled,
    sourceZoneIndex,
  }: {
    image: any;
    index: number;
    name: string;
    onDrop: (imageIndex: number, targetZoneIndex: number, sourceZoneIndex?: number) => void;
    disabled?: boolean;
    sourceZoneIndex?: number;
  }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [isDragging, setIsDragging] = useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          setIsDragging(true);
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gestureState) => {
          const dropZoneIndex = checkDropZone(gestureState.moveX, gestureState.moveY);
          onDrop(index, dropZoneIndex, sourceZoneIndex);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          setIsDragging(false);
        },
      })
    ).current;

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          { transform: pan.getTranslateTransform() },
          styles.imageContainer,
          isDragging && { zIndex: 999, elevation: 999 },
        ]}
      >
        <Image source={image} style={[styles.image, disabled && { opacity: 0.3 }]} />
      </Animated.View>
    );
  };

  const checkDropZone = (x: number, y: number) => {
    return dropZonesLayout.findIndex((zone) => {
      if (!zone) return false;
      const { x: zoneX, y: zoneY, width, height } = zone;
      return x >= zoneX && x <= zoneX + width && y >= zoneY && y <= zoneY + height;
    });
  };

  const startGame = async () => {
    setAttemptCount(0);
    const soundList: { sound: Audio.Sound; name: string }[] = [];
    for (const soundPath of sounds) {
      const { sound } = await Audio.Sound.createAsync(soundPath.sound);
      soundList.push({ sound, name: soundPath.name });
    }

    const shuffledList = shuffleArray(soundList);
    setPlayList(shuffledList);

    const randomSounds = getRandomElements(shuffledList, 3);
    const correctNames = [];
    for (const randomSound of randomSounds) {
      correctNames.push(randomSound.name)
      await randomSound.sound.playAsync();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCorrectSoundNames(correctNames);

    setIsGameStarted(true);
    alert('소리 재생이 끝났습니다! 선택하세요.');
  };

  const submit = () => {
    if (droppedImages.includes(null)) {
      alert('빈 공간을 모두 채워주세요.');
      return;
    }

    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);
    
    let correct = true;
    for (let i = 0; i < correctSoundNames.length; i++) {
      if (correctSoundNames[i] != droppedImages[i]) {
        correct = false;
        break;
      }
    }

    if (correct) {
      alert('정답! 잘 하셨습니다!');
      
      starContext?.addStar('orderGame');
      if (currentAttempt === 1) {
        clearContext?.markAsCleared('orderGame');
      }
      endGame();
    } else {
      alert('오답! 다시 시도해 보세요!');
    }
  }

  const endGame = async () => {
    for (const soundObj of playList) {
      try {
        const status = await soundObj.sound.getStatusAsync();
        if (status.isLoaded) {
          await soundObj.sound.unloadAsync();
        }
      } catch (error) {
        console.error(`${soundObj.name} 언로드 오류: `, error);
      }
    }

    setIsGameStarted(false);
    setPlayList([]);
    setDroppedImages([null, null, null]);
  };

  useEffect(() => {
    return () => {
      playList.forEach(async (soundObj) => {
        try {
          const status = await soundObj.sound.getStatusAsync();
          if (status.isLoaded) {
            await soundObj.sound.unloadAsync();
          }
        } catch (error) {
          console.error(`${soundObj.name} 언로드 오류: `, error);
        }
      });
    };
  }, [playList]);

  const getRandomElements = (arr: any[], num: number): any[] => {
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
  };

  const shuffleArray = (array: any[]) => {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleDrop = (
    imageIndex: number,
    targetZoneIndex: number,
    sourceZoneIndex?: number
  ) => {
    const imageName = sounds[imageIndex].name;
    const newDroppedImages = [...droppedImages];  

    if (sourceZoneIndex !== undefined) {
      if (targetZoneIndex === -1) {
        newDroppedImages[sourceZoneIndex] = null;
      } else {
        const imageThatWasInTarget = newDroppedImages[targetZoneIndex];
        newDroppedImages[targetZoneIndex] = imageName;
        newDroppedImages[sourceZoneIndex] = imageThatWasInTarget;
      }
    } else {
      if (targetZoneIndex !== -1) {
        const existingIndex = newDroppedImages.indexOf(imageName);
        if (existingIndex > -1) {
          newDroppedImages[existingIndex] = null;
        }
        newDroppedImages[targetZoneIndex] = imageName;
      }
    }
    setDroppedImages(newDroppedImages);
  };

  return (
    <View style={styles.container}>
      <MissionProgressIcon
        gameId="orderGame"
        title="소리 순서 미션"
        missionText="정답 맞추기"
        clearText="첫 번째 시도에서 정답 맞추기"
        progressItems={[
          { label: '현재 시도 횟수', value: `${attemptCount}회` }
        ]}
      />

      {!isGameStarted ? (
        <Button title="게임시작" onPress={startGame} />
      ) : (
        <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={{ alignItems: 'center' }}>
          <View style={styles.imagesContainer}>
            {sounds.map((soundItem, index) => {
              const isDropped = droppedImages.includes(soundItem.name);
              return (
                <DraggableImage
                  key={`top-${soundItem.name}`}
                  image={soundItem.image}
                  index={index}
                  name={soundItem.name}
                  onDrop={handleDrop}
                  disabled={isDropped}
                />
              );
            })}
          </View>
          <View style={styles.dropZoneContainer}>
            {Array.from({ length: 3 }, (_, i) => {
              const imageName = droppedImages[i];
              const soundItem = sounds.find((s) => s.name === imageName);
              return (
                <View
                  key={`zone-${i}`}
                  ref={(el) => {
                    dropZoneRefs.current[i] = el;
                  }}
                  style={styles.dropZone}
                  onLayout={() => {
                    dropZoneRefs.current[i]?.measure((_x, _y, width, height, pageX, pageY) => {
                      setDropZonesLayout((prev) => {
                        const newLayouts = [...prev];
                        newLayouts[i] = { x: pageX, y: pageY, width, height };
                        return newLayouts;
                      });
                    });
                  }}
                >
                  {imageName && soundItem ? (
                    <DraggableImage
                      image={soundItem.image}
                      index={sounds.indexOf(soundItem)}
                      name={soundItem.name}
                      onDrop={handleDrop}
                      sourceZoneIndex={i}
                    />
                  ) : (
                    <Text style={{ color: '#aaa' }}>놓는곳</Text>
                  )}
                </View>
              );
            })}
          </View>
          <Button title="정답 제출" onPress={submit} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 20,
  },
  imageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: 120,
  },
  dropZone: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'gray',
    borderStyle: 'dashed',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});