import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { DRUM_INSTRUMENTS, InstrumentType } from '../constants/drumSounds';

export function useAudioPlayer() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setupAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('오디오 설정 오류:', error);
    }
  };

  const playSound = async (
    instrument: InstrumentType,
    onComplete?: () => void
  ): Promise<void> => {
    try {
      setIsPlaying(true);

      // 이전 사운드 정리
      if (sound) {
        await sound.unloadAsync();
      }

      const soundSource = DRUM_INSTRUMENTS[instrument].sound;
      const drumInfo = DRUM_INSTRUMENTS[instrument];
      console.log(`🔊 Playing ${drumInfo.name}: ${drumInfo.description}`);

      const { sound: newSound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        volume: 1.0,
      });

      setSound(newSound);

      // 재생 완료 처리
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          onComplete?.();
        }
      });

      // 백업 타이머 (3초)
      setTimeout(() => {
        setIsPlaying(false);
        onComplete?.();
      }, 3000);
    } catch (error) {
      console.error('사운드 재생 오류:', error);
      setIsPlaying(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  return {
    playSound,
    stopSound,
    isPlaying,
  };
}
