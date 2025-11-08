import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { AvatarLevel } from '@/types/avatar';
import { RelicAnimation } from '@/components/animations';

interface LevelUpModalProps {
  visible: boolean;
  newLevel: AvatarLevel;
  onClose: () => void;
}

/**
 * 🎊 레벨업 축하 모달
 * 
 * 애니메이션 효과:
 * - 페이드인/아웃
 * - 크기 변화 (바운스 효과)
 * - Lottie 축하 애니메이션 (confetti 등)
 */
export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  newLevel,
  onClose,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const [showRelicAnimation, setShowRelicAnimation] = useState(false);

  useEffect(() => {
    if (visible) {
      // 먼저 모달 애니메이션 시작
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 500ms 후 유물 애니메이션 시작
      const relicTimer = setTimeout(() => {
        setShowRelicAnimation(true);
      }, 500);

      return () => clearTimeout(relicTimer);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      setShowRelicAnimation(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          {/* 🎊 유물 애니메이션 */}
          <RelicAnimation
            type="confetti"
            show={showRelicAnimation}
            duration={2500}
            size={300}
            position={{ x: -150, y: -150 }}
            onComplete={() => setShowRelicAnimation(false)}
          />

          <Text style={styles.title}>🎊 레벨 업!</Text>
          
          {/* 아바타 표시 */}
          <View style={[styles.avatarCircle, { backgroundColor: `${newLevel.color}20`, borderColor: newLevel.color }]}>
            <Text style={styles.avatarEmoji}>{newLevel.emoji}</Text>
          </View>

          <View style={[styles.levelBadge, { backgroundColor: newLevel.color }]}>
            <Text style={styles.levelText}>Level {newLevel.level}</Text>
          </View>

          <Text style={styles.avatarName}>{newLevel.name}</Text>
          <Text style={styles.unlockMessage}>{newLevel.unlockMessage}</Text>
          <Text style={styles.description}>{newLevel.description}</Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: newLevel.color }]} onPress={onClose}>
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarEmoji: {
    fontSize: 80,
  },
  levelBadge: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
  },
  levelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  unlockMessage: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

