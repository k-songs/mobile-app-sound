import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { InstrumentType } from '../../constants/drumSounds';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 드럼세트 이미지 기준 악기 위치 (상대적 좌표)
const DRUM_POSITIONS = {
  hihat: { x: 0.75, y: 0.25 },    // 오른쪽 상단
  snare: { x: 0.5, y: 0.45 },     // 중앙
  kick: { x: 0.5, y: 0.75 },      // 중앙 하단
  cymbal: { x: 0.25, y: 0.45 },   // 왼쪽 중앙
};

interface InteractiveDrumSetProps {
  onInstrumentPlay?: (instrument: InstrumentType) => void;
}

export function InteractiveDrumSet({ onInstrumentPlay }: InteractiveDrumSetProps) {
  const audioPlayer = useAudioPlayer();
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType | null>(null);
  
  // 애니메이션 값들
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // 드럼세트 컨테이너 크기 (화면 너비의 90%)
  const drumSetSize = screenWidth * 0.9;
  const characterSize = 60;

  // 거리 계산 함수
  const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  };

  // 가장 가까운 악기 위치 찾기
  const findNearestInstrument = (x: number, y: number): InstrumentType | null => {
    const relativeX = x / drumSetSize;
    const relativeY = y / drumSetSize;
    
    let nearestInstrument: InstrumentType | null = null;
    let minDistance = Infinity;
    
    Object.entries(DRUM_POSITIONS).forEach(([instrument, position]) => {
      const distance = calculateDistance({ x: relativeX, y: relativeY }, position);
      if (distance < minDistance && distance < 0.15) { // 15% 이내에서만 스냅
        minDistance = distance;
        nearestInstrument = instrument as InstrumentType;
      }
    });
    
    return nearestInstrument;
  };

  // 악기 위치로 스냅
  const snapToInstrument = (instrument: InstrumentType) => {
    const position = DRUM_POSITIONS[instrument];
    const targetX = position.x * drumSetSize - characterSize / 2;
    const targetY = position.y * drumSetSize - characterSize / 2;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: targetX,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: targetY,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          useNativeDriver: true,
          duration: 100,
        }),
        Animated.timing(scale, {
          toValue: 1,
          useNativeDriver: true,
          duration: 100,
        }),
      ]),
    ]).start();

    setCharacterPosition({ x: targetX, y: targetY });
    setCurrentInstrument(instrument);
    
    // 소리 재생
    audioPlayer.playSound(instrument);
    onInstrumentPlay?.(instrument);
  };

  // 제스처 핸들러
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = event.nativeEvent;
    
    translateX.setValue(characterPosition.x + translationX);
    translateY.setValue(characterPosition.y + translationY);
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      const newX = characterPosition.x + translationX;
      const newY = characterPosition.y + translationY;
      
      // 경계 체크
      const boundedX = Math.max(0, Math.min(drumSetSize - characterSize, newX));
      const boundedY = Math.max(0, Math.min(drumSetSize - characterSize, newY));
      
      // 가장 가까운 악기 찾기
      const nearestInstrument = findNearestInstrument(boundedX + characterSize / 2, boundedY + characterSize / 2);
      
      if (nearestInstrument) {
        // 악기 위치로 스냅
        snapToInstrument(nearestInstrument);
      } else {
        // 원래 위치로 복귀
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: boundedX,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: boundedY,
            useNativeDriver: true,
          }),
        ]).start();
        
        setCharacterPosition({ x: boundedX, y: boundedY });
        setCurrentInstrument(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 드럼세트 이미지 */}
      <View style={[styles.drumSetContainer, { width: drumSetSize, height: drumSetSize }]}>
        <Image
          source={require('../../assets/images/100_1.png')}
          style={styles.drumSetImage}
          resizeMode="contain"
        />
        
        {/* 악기 위치 표시 (개발용 - 나중에 제거 가능) */}
        {Object.entries(DRUM_POSITIONS).map(([instrument, position]) => (
          <View
            key={instrument}
            style={[
              styles.instrumentMarker,
              {
                left: position.x * drumSetSize - 10,
                top: position.y * drumSetSize - 10,
                backgroundColor: currentInstrument === instrument ? '#4CAF50' : '#FF5722',
              },
            ]}
          />
        ))}
        
        {/* 드래그 가능한 캐릭터 */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.character,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/images/50_1.png')}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
      
      {/* 현재 악기 표시 */}
      {currentInstrument && (
        <View style={styles.currentInstrumentDisplay}>
          <Text style={styles.currentInstrumentText}>
            🎵 {currentInstrument.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  drumSetContainer: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    elevation: 3,
    marginBottom: 20,
  },
  drumSetImage: {
    width: '100%',
    height: '100%',
  },
  instrumentMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.7,
  },
  character: {
    position: 'absolute',
    width: 60,
    height: 60,
    zIndex: 10,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  currentInstrumentDisplay: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
  },
  currentInstrumentText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default InteractiveDrumSet;
