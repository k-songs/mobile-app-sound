import { useState, useCallback } from 'react';

export interface BalanceTestState {
  correctSide: 'left' | 'right' | null;
  balanceTestCount: number;
  balanceScore: number;
  balanceGameStarted: boolean;
}

export function useBalanceTest() {
  const [balanceState, setBalanceState] = useState<BalanceTestState>({
    correctSide: null,
    balanceTestCount: 0,
    balanceScore: 0,
    balanceGameStarted: false
  });

  const playBalanceSound = useCallback(async (side: 'left' | 'right') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const panner = audioContext.createStereoPanner();

      // 660Hz (E5) - 더 높은 톤으로 명확하게
      oscillator.frequency.value = 660;
      oscillator.type = 'triangle';
      gainNode.gain.value = 0.3;
      panner.pan.value = side === 'left' ? -1 : 1;

      oscillator.connect(panner);
      panner.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      const timestamp = Date.now();

      return {
        sound: `${side === 'left' ? '👂' : '👂'} ${side.toUpperCase()}`,
        timestamp,
        stop: () => {
          oscillator.stop();
          audioContext.close();
        }
      };

    } catch (error) {
      console.error('Web Audio API error:', error);
      
      const timestamp = Date.now();
      return {
        sound: `${side === 'left' ? '👂' : '👂'} ${side.toUpperCase()}`,
        timestamp,
        stop: () => {}
      };
    }
  }, []);

  const startBalanceTest = useCallback(() => {
    setBalanceState(prev => ({
      ...prev,
      balanceGameStarted: true,
      balanceTestCount: 0,
      balanceScore: 0,
      correctSide: null
    }));
  }, []);

  const handleBalanceResponse = useCallback((selectedSide: 'left' | 'right') => {
    if (!balanceState.correctSide) return null;

    const isCorrect = selectedSide === balanceState.correctSide;
    const newTestCount = balanceState.balanceTestCount + 1;

    const updatedState: Partial<BalanceTestState> = {
      balanceTestCount: newTestCount
    };

    if (isCorrect) {
      updatedState.balanceScore = balanceState.balanceScore + 100;
    }

    setBalanceState(prev => ({ ...prev, ...updatedState }));

    return {
      isCorrect,
      newTestCount
    };
  }, [balanceState.correctSide, balanceState.balanceTestCount, balanceState.balanceScore]);

  const calculateBalanceScore = useCallback(() => {
    const { balanceScore, balanceTestCount } = balanceState;
    const accuracy = balanceTestCount > 0 
      ? Math.round((balanceScore / 100) / balanceTestCount * 100) 
      : 0;

    return {
      score: balanceScore,
      accuracy,
      perfectCount: Math.floor(balanceScore / 100)
    };
  }, [balanceState.balanceScore, balanceState.balanceTestCount]);

  const resetBalanceTest = useCallback(() => {
    setBalanceState({
      correctSide: null,
      balanceTestCount: 0,
      balanceScore: 0,
      balanceGameStarted: false
    });
  }, []);

  return {
    balanceState,
    playBalanceSound,
    startBalanceTest,
    handleBalanceResponse,
    calculateBalanceScore,
    resetBalanceTest
  };
}
