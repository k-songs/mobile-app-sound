import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { DRUM_INSTRUMENTS, InstrumentType } from '../constants/drumSounds';

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const playSound = async (
    instrument: InstrumentType,
    onComplete?: () => void
  ): Promise<void> => {
    try {
      setIsPlaying(true);
      completedRef.current = false;

      // 이전 타이머 정리
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // 이전 사운드 정리
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const soundSource = DRUM_INSTRUMENTS[instrument].sound;
      const drumInfo = DRUM_INSTRUMENTS[instrument];
      console.log(`🔊 Playing ${drumInfo.name}: ${drumInfo.description}`);

      // 새로운 사운드 생성
      const { sound: newSound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        volume: 1.0,
      });

      soundRef.current = newSound;

      // 재생 완료 감지
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish && !completedRef.current) {
          completedRef.current = true;
          setIsPlaying(false);
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          onComplete?.();
        }
      });

      // 백업 타이머 (5초) - 만약을 위한 안전장치
      timerRef.current = setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          setIsPlaying(false);
          onComplete?.();
          console.log('⚠️ 백업 타이머로 재생 완료 처리');
        }
      }, 5000);
    } catch (error) {
      console.error('사운드 재생 오류:', error);
      setIsPlaying(false);
      completedRef.current = false;
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        console.error('사운드 중지 오류:', error);
      }
    }
  };

  return {
    playSound,
    stopSound,
    isPlaying,
  };
}
