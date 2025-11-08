import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { InstrumentType } from '../../constants/drumSounds';

const { width: initialScreenWidth, height: initialScreenHeight } = Dimensions.get('window');


const DRUM_IMAGE_ASPECT_RATIO = 1; 

//악기 위치 
const DRUM_POSITIONS = {
  hihat: { x: 0.75, y: 0.33 },   
  snare: { x: 0.65, y: 0.45 },     
  kick: { x: 0.42, y: 0.65 },      
  cymbal: { x: 0.32, y: 0.45 },   
};

interface InteractiveDrumSetProps {
  onInstrumentPlay?: (instrument: InstrumentType) => void;
}

export function InteractiveDrumSet({ onInstrumentPlay }: InteractiveDrumSetProps) {
  const audioPlayer = useAudioPlayer();
  const insets = useSafeAreaInsets();
  const [dimensions, setDimensions] = useState({ width: initialScreenWidth, height: initialScreenHeight });
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType | null>(null);
  const [showHint, setShowHint] = useState(true);

  // 애니메이션 값들
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const characterPulse = useRef(new Animated.Value(1)).current;
  const markerPulse = useRef(new Animated.Value(1)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;

  // 캐릭터 초기 위치를 하단 중앙으로 설정
  useEffect(() => {
    const currentAvailableHeight = dimensions.height - insets.top - insets.bottom;
    const currentAvailableWidth = dimensions.width - insets.left - insets.right;
    const currentDrumSetSize = Math.min(currentAvailableWidth * 0.9, currentAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
    const currentCharacterSize = Math.max(40, currentDrumSetSize * 0.15);
    
    const centerX = (currentDrumSetSize - currentCharacterSize) / 2;
    const bottomY = currentDrumSetSize - currentCharacterSize - 20; // 하단에서 20px 여유
    
    translateX.setValue(centerX);
    translateY.setValue(bottomY);
    setCharacterPosition({ x: centerX, y: bottomY });
  }, []);

  // 캐릭터 펄스 애니메이션
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(characterPulse, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(characterPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // 드럼 마커 펄스 애니메이션
  useEffect(() => {
    const markerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(markerPulse, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(markerPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    markerAnimation.start();
    return () => markerAnimation.stop();
  }, []);

  // 힌트 페이드 인/아웃 애니메이션
  useEffect(() => {
    const hintAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(hintOpacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    hintAnimation.start();
    
    // 10초 후 힌트 숨기기
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 10000);
    
    return () => {
      hintAnimation.stop();
      clearTimeout(timer);
    };
  }, []);

  // 디바이스 크기 변경 감지 및 캐릭터 위치 조정
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newDimensions = { width: window.width, height: window.height };
      const newAvailableHeight = newDimensions.height - insets.top - insets.bottom;
      const newAvailableWidth = newDimensions.width - insets.left - insets.right;
      const newDrumSetSize = Math.min(newAvailableWidth * 0.9, newAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
      const newCharacterSize = Math.max(40, newDrumSetSize * 0.1);

      // 캐릭터 위치가 새 경계를 벗어났는지 확인하고 조정
      const maxX = newDrumSetSize - newCharacterSize;
      const maxY = newDrumSetSize - newCharacterSize;

      let adjustedX = characterPosition.x;
      let adjustedY = characterPosition.y;

      if (characterPosition.x > maxX) adjustedX = maxX;
      if (characterPosition.y > maxY) adjustedY = maxY;

      // 위치가 변경되었다면 애니메이션과 함께 업데이트
      if (adjustedX !== characterPosition.x || adjustedY !== characterPosition.y) {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: adjustedX,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: adjustedY,
            useNativeDriver: true,
          }),
        ]).start();

        setCharacterPosition({ x: adjustedX, y: adjustedY });
      }

      setDimensions(newDimensions);
    });

    return () => subscription?.remove();
  }, [characterPosition]);


  const availableHeight = dimensions.height - insets.top - insets.bottom;
  const availableWidth = dimensions.width - insets.left - insets.right;

  // 반응형 드럼세트 크기 계산 
  const maxContainerWidth = availableWidth * 0.9;
  const maxContainerHeight = availableHeight * 0.6; // Safe Area 내 가용 높이의 60%
  const drumSetSize = Math.min(maxContainerWidth, maxContainerHeight / DRUM_IMAGE_ASPECT_RATIO);
  const characterSize = Math.max(40, drumSetSize * 0.15); 

  // 거리 계산 함수
  const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  };

  // 가장 가까운 악기 위치 찾기 
  const findNearestInstrument = (x: number, y: number): InstrumentType | null => {
    const currentAvailableHeight = dimensions.height - insets.top - insets.bottom;
    const currentAvailableWidth = dimensions.width - insets.left - insets.right;
    const currentDrumSetSize = Math.min(currentAvailableWidth * 0.9, currentAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
    const relativeX = x / currentDrumSetSize;
    const relativeY = y / currentDrumSetSize;

    let nearestInstrument: InstrumentType | null = null;
    let minDistance = Infinity;

    Object.entries(DRUM_POSITIONS).forEach(([instrument, position]) => {
      const distance = calculateDistance({ x: relativeX, y: relativeY }, position);

      const snapThreshold = Math.max(0.12, 0.2 - (currentDrumSetSize / 1000));
      if (distance < minDistance && distance < snapThreshold) {
        minDistance = distance;
        nearestInstrument = instrument as InstrumentType;
      }
    });

    return nearestInstrument;
  };

  // 악기 위치
  const snapToInstrument = (instrument: InstrumentType) => {
    const position = DRUM_POSITIONS[instrument];
    const currentAvailableHeight = dimensions.height - insets.top - insets.bottom;
    const currentAvailableWidth = dimensions.width - insets.left - insets.right;
    const currentDrumSetSize = Math.min(currentAvailableWidth * 0.9, currentAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
    const targetX = position.x * currentDrumSetSize - characterSize / 2;
    const targetY = position.y * currentDrumSetSize - characterSize / 2;

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

  // 제스처 
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    // 첫 터치 시 힌트 숨기기
    if (showHint) {
      setShowHint(false);
    }

    const { translationX, translationY } = event.nativeEvent;

    // Safe Area 경계 제한
    const currentAvailableHeight = dimensions.height - insets.top - insets.bottom;
    const currentAvailableWidth = dimensions.width - insets.left - insets.right;
    const currentDrumSetSize = Math.min(currentAvailableWidth * 0.9, currentAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
    const maxX = currentDrumSetSize - characterSize;
    const maxY = currentDrumSetSize - characterSize;

    let newX = characterPosition.x + translationX;
    let newY = characterPosition.y + translationY;

    // 실시간 경계 체크
    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));

    translateX.setValue(newX);
    translateY.setValue(newY);
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      const newX = characterPosition.x + translationX;
      const newY = characterPosition.y + translationY;

      // Safe Area를 고려한 경계 체크
      const currentAvailableHeight = dimensions.height - insets.top - insets.bottom;
      const currentAvailableWidth = dimensions.width - insets.left - insets.right;
      const currentDrumSetSize = Math.min(currentAvailableWidth * 0.9, currentAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
      const boundedX = Math.max(0, Math.min(currentDrumSetSize - characterSize, newX));
      const boundedY = Math.max(0, Math.min(currentDrumSetSize - characterSize, newY));

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
  
      <View style={[styles.drumSetContainer, { width: drumSetSize, height: drumSetSize }]}>
        <Image
          source={require('../../assets/images/100_1.png')}
          style={styles.drumSetImage}
          resizeMode="contain"
        />
        
     
        {Object.entries(DRUM_POSITIONS).map(([instrument, position]) => {
          const currentAvailableHeight = dimensions.height - insets.top - insets.bottom;
          const currentAvailableWidth = dimensions.width - insets.left - insets.right;
          const currentDrumSetSize = Math.min(currentAvailableWidth * 0.9, currentAvailableHeight * 0.6 / DRUM_IMAGE_ASPECT_RATIO);
          const markerSize = 30;
          return (
            <Animated.View
              key={instrument}
              style={[
                styles.instrumentMarker,
                {
                  left: position.x * currentDrumSetSize - markerSize / 2,
                  top: position.y * currentDrumSetSize - markerSize / 2,
                  width: markerSize,
                  height: markerSize,
                  borderRadius: markerSize / 2,
                  backgroundColor: currentInstrument === instrument ? '#4CAF50' : '#FF9800',
                  transform: [{ scale: markerPulse }],
                },
              ]}
            >
              <View style={styles.markerInner}>
                <Text style={styles.markerText}>🎵</Text>
              </View>
            </Animated.View>
          );
        })}

        {/* 드래그 가능한 캐릭터 */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.character,
              {
                width: characterSize,
                height: characterSize,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: Animated.multiply(scale, characterPulse) },
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

        {/* 캐릭터 위의 드래그 힌트 */}
        {showHint && (
          <Animated.View 
            style={[
              styles.hintMessage,
              {
                opacity: hintOpacity,
                transform: [
                  { translateX: Animated.subtract(translateX, new Animated.Value(60)) },
                  { translateY: Animated.subtract(translateY, new Animated.Value(characterSize + 215)) }
                ]
              }
            ]}
          >
            <Text style={styles.hintMessageText}>밀어서 악기에 붙이세요!</Text>
          </Animated.View>
        )}
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
    opacity: 0.85,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  markerText: {
    fontSize: 16,
  },
  character: {
    position: 'absolute',
    zIndex: 10,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  hintMessage: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 152, 0, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  hintMessageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
