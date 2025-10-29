// app/(tabs)/new/utils/gameData.ts

/**
 * 게임 데이터 구성 (총 6개 게임)
 * 
 * 📋 게임 분류:
 * 1. 기본 게임 (3개): matchGame, orderGame, music
 * 2. AI/ML 게임 (3개): matchGameAI, matchGamePG, matchGameRL
 * 
 * 🤖 AI 게임 차이점:
 * - matchGameAI: 기본 AI 학습 알고리즘 (프로토타입)
 * - matchGamePG: Policy Gradient 기반 (정책 학습) 정책 경사법
 * - matchGameRL: Reinforcement Learning 기반 (보상 학습)강화
 * 
 * 💡 참고: AI 게임들은 유사한 기능이지만 다른 학습 방식을 사용
 */
export const GAME_DATA = [
  // 기본 게임들
  { 
    id: 'matchGame', 
    name: '🎵 소리 맞추기', 
    icon: 'game-controller-outline',
    route: {
      layout: '/new/(games)/matchGame',
      index: '(games)/matchGame'
    }
    // 기본 소리 맞추기 게임 - 단순한 정답/오답 방식
  },
  { 
    id: 'orderGame', 
    name: '🎶 순서 맞추기', 
    icon: 'swap-horizontal-outline',
    route: {
      layout: '/new/(games)/orderGame',
      index: '(games)/orderGame'
    }
    // 소리 순서를 기억하고 맞추는 게임
  },
  {
    id: 'music', 
    name: '🎹 건반 음 맞추기', 
    icon: 'musical-notes-outline',
    route: {
      layout: '/new/(games)/music',
      index: '(games)/music'
    }
    // 피아노 건반을 이용한 음계 학습 게임
  },
  { 
    id: 'matchGamePG', 
    name: '🎲 PG 게임', 
    icon: 'analytics-outline',
    route: {
      layout: '/new/(games)/matchGamePG',
      index: '(games)/matchGamePG'
    }
  
  },
  { 
    id: 'matchGameRL', 
    name: '🚀 강화학습', 
    icon: 'rocket-outline',
    route: {
      layout: '/new/(games)/matchGameAI',
      index: '(games)/matchGameRL'
    }
  
  }
] as const;

    
export type GameRoute = {
  layout: string;
  index: string;
};

export type GameDataType = {
  id: string;
  name: string;
  icon: string;
  route: GameRoute;
};






