import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export type RelicType = 'confetti' | 'treasure' | 'sparkle' | 'splash' | 'levelup';

interface RelicAnimationProps {
  type: RelicType;
  show: boolean;
  onComplete?: () => void;
  duration?: number;
  size?: number;
  position?: { x: number; y: number };
}

/**
 * 🎊 유물 애니메이션 컴포넌트
 *
 * 다양한 보상/유물 애니메이션을 제공합니다:
 * - confetti: 축하 폭죽
 * - treasure: 보물 상자
 * - sparkle: 빛나는 효과
 * - splash: 메달 획득
 * - levelup: 레벨업 효과
 */
export const RelicAnimation: React.FC<RelicAnimationProps> = ({
  type,
  show,
  onComplete,
  duration = 2000,
  size = 200,
  position = { x: 0, y: 0 }
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (show) {
      // 초기화
      scale.value = 0;
      opacity.value = 0;
      translateY.value = 50;
      rotation.value = 0;

      // 애니메이션 실행
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });

      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: duration - 400 }),
        withTiming(0, { duration: 200 })
      );

      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });

      // 회전 효과 (메달, 보물 타입에만 적용)
      if (type === 'splash' || type === 'treasure') {
        rotation.value = withSequence(
          withTiming(360, { duration: duration * 0.6, easing: Easing.out(Easing.cubic) }),
          withTiming(360, { duration: duration * 0.4 })
        );
      }

      // 완료 콜백
      if (onComplete) {
        const timeoutId = setTimeout(() => {
          runOnJS(onComplete)();
        }, duration);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [show, type, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: type === 'splash' || type === 'treasure' ? `${rotation.value}deg` : '0deg' }
    ],
    opacity: opacity.value,
  }));

  const getLottieSource = () => {
    switch (type) {
      case 'confetti':
        return require('../../assets/lottie/confetti.json');
      case 'treasure':
        return require('../../assets/lottie/treasure.json');
      case 'splash':
        return require('../../assets/lottie/shilvermedal.json');
      case 'sparkle':
        return require('../../assets/lottie/sparkle.json');
      case 'levelup':
        // levelup은 특별한 효과로 confetti 사용
        return require('../../assets/lottie/confetti.json');
      default:
        return require('../../assets/lottie/confetti.json');
    }
  };

  const getEmoji = () => {
    switch (type) {
      case 'confetti':
        return '🎊';
      case 'treasure':
        return '💎';
      case 'sparkle':
        return '✨';
      case 'splash':
        return '🏅';
      case 'levelup':
        return '⭐';
      default:
        return '🎊';
    }
  };

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          width: size,
          height: size,
          left: position.x,
          top: position.y,
        }
      ]}
    >
      <LottieView
        source={getLottieSource()}
        autoPlay
        loop={type === 'sparkle'}
        style={styles.lottie}
        duration={duration}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
