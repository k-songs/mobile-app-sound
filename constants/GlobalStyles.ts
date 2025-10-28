import { StyleSheet } from 'react-native';

//  공통 색상 팔레트 (최적화된 시맨틱 색상 시스템)
export const Colors = {
  // Primary Colors - 5단계로 간소화
  primary: {
    lightest: '#EBF5FF',  // 50-200 통합
    light: '#76A9FA',     // 300-400 통합
    main: '#4A90E2',      // 500 (기본)
    dark: '#1A56DB',      // 600-700 통합
    darkest: '#233876',   // 800-900 통합
  },

  // Accent Colors - 주요 색상만 유지
  accent: {
    lightest: '#FFF8DC',  // 50-200 통합
    light: '#FFD54F',     // 300-400 통합
    main: '#FFC107',      // 500 (기본)
    dark: '#FF8F00',      // 600-700 통합
    darkest: '#E65100',   // 800-900 통합
  },

  // Status Colors - 핵심만 유지
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Neutral Colors - 통합된 중립 색상
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    lightest: '#FAFAFA',  // 50-100 통합
    light: '#E0E0E0',     // 200-300 통합
    medium: '#9E9E9E',    // 400-500 통합
    dark: '#424242',      // 600-800 통합
    darkest: '#212121',   // 900
  },

  // Legacy aliases for backward compatibility
  white: '#FFFFFF',
  black: '#000000',
  textDark: '#212121',
  textLight: '#666666',

  // Semantic Colors - 의미론적 색상
  semantic: {
    background: '#F5F5F5',
    backgroundLight: '#F8F9FA',
    surface: '#FFFFFF',
  },

  // Text Colors - 통합된 텍스트 색상
  text: {
    primary: '#212121',
    secondary: '#666666',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: {
    light: '#E9ECEF',
    default: '#E0E0E0',
    dark: '#BDBDBD',
  },
} as const;

// 스타일 유틸리티 함수들
export const StyleUtils = {
  // 그림자 생성 유틸리티 (iOS 설정 제거)
  createShadow: (elevation: number = 3) => ({
    elevation,
  }),

  // 반응형 크기 조정
  responsiveSize: (base: number, factor: number = 1) => base * factor,

  // 색상 조합 생성
  createColorScheme: (baseColor: string, opacity: number = 1) => ({
    solid: baseColor,
    semi: baseColor.replace(/[\d.]+\)$/g, `${opacity})`),
  }),

  // 공통 스타일 패턴
  createBaseComponent: (styles: any) => styles,

  // 동적 스타일 생성
  createDynamicStyle: (theme: 'light' | 'dark' = 'light') => ({
    backgroundColor: theme === 'light' ? Colors.semantic.background : Colors.neutral.darkest,
    color: theme === 'light' ? Colors.text.primary : Colors.text.inverse,
  }),
};

// 📱 공통 레이아웃 스타일
export const Layout = StyleSheet.create({
  // 컨테이너 패턴들
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.semantic.background,
  },

  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.semantic.background,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerContainerWithPadding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // 스크롤 컨테이너
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.semantic.background,
  },

  // 헤더 스타일
  header: {
    backgroundColor: Colors.primary.darkest,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  // 카드 스타일
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...StyleUtils.createShadow(3),
  },

  cardContent: {
    backgroundColor: Colors.neutral.lightest,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },

  // 콘텐츠 컨테이너 (GameHeader 등에서 사용)
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 20,
  },
});

// 
export const Cards = StyleSheet.create({
  default: Layout.card,
  large: {
    ...Layout.card,
    borderRadius: 16,
    padding: 24,
    ...StyleUtils.createShadow(4),
  },
  small: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    padding: 12,
    ...StyleUtils.createShadow(2),
  },
  info: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.info,
  },
  success: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.success,
  },
});

// 🔘 버튼 스타일 패턴들 (통합된 베이스 스타일 활용)
const baseButtonStyle = {
  borderRadius: 12,
  paddingVertical: 15,
  paddingHorizontal: 20,
  ...StyleUtils.createShadow(3),
};

export const Buttons = StyleSheet.create({
  primary: {
    ...baseButtonStyle,
    backgroundColor: Colors.primary.main,
  },

  primaryLarge: {
    ...baseButtonStyle,
    backgroundColor: Colors.primary.main,
    paddingVertical: 18,
    paddingHorizontal: 30,
    ...StyleUtils.createShadow(3),
  },

  primarySmall: {
    ...baseButtonStyle,
    backgroundColor: Colors.primary.main,
    paddingVertical: 10,
    paddingHorizontal: 15,
    ...StyleUtils.createShadow(2),
  },

  secondary: {
    ...baseButtonStyle,
    backgroundColor: Colors.accent.main,
  },

  accent: {
    ...baseButtonStyle,
    backgroundColor: Colors.accent.main,
  },

  success: {
    ...baseButtonStyle,
    backgroundColor: Colors.status.success,
  },

  warning: {
    ...baseButtonStyle,
    backgroundColor: Colors.status.warning,
  },

  error: {
    ...baseButtonStyle,
    backgroundColor: Colors.status.error,
  },

  info: {
    ...baseButtonStyle,
    backgroundColor: Colors.status.info,
  },

  disabled: {
    ...baseButtonStyle,
    backgroundColor: Colors.neutral.medium,
    ...StyleUtils.createShadow(1),
  },

  game: {
    backgroundColor: Colors.primary.main,
    borderRadius: 100,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleUtils.createShadow(5),
  },

  mode: {
    ...baseButtonStyle,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 15,
    marginBottom: 10,
    ...StyleUtils.createShadow(2),
  },

  modeActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.lightest,
  },

  modeDisabled: {
    backgroundColor: Colors.neutral.light,
    borderColor: Colors.border.default,
  },
});

// 📝 텍스트 스타일 패턴들 (통합된 색상 시스템 활용)
export const Typography = StyleSheet.create({
  // 제목 스타일들
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
    textAlign: 'center',
  },

  titleSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 20,
    textAlign: 'center',
  },

  // 게임 제목
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    marginBottom: 8,
  },

  gameSubtitle: {
    fontSize: 16,
    color: Colors.neutral.light,
    textAlign: 'center',
  },

  // 카드 제목
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },

  // 카드 내용
  cardContent: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },

  // 설명 텍스트
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },

  // 지시사항 텍스트
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },

  // 힌트 텍스트
  hint: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },

  // 설정 텍스트
  settings: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },

  // 버튼 텍스트
  button: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    textAlign: 'center',
  },

  buttonLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    textAlign: 'center',
  },

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
    textAlign: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    textAlign: 'center',
  },

  // 아이콘 텍스트
  icon: {
    fontSize: 28,
    color: Colors.text.primary,
  },

  iconLarge: {
    fontSize: 32,
    color: Colors.text.primary,
  },

  // 본문 텍스트
  body: {
    fontSize: 16,
    color: Colors.text.secondary,
  },

  bodySmall: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  bodyBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  caption: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});

// 🎭 모달/오버레이 스타일 패턴들
export const Modals = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    ...StyleUtils.createShadow(10),
    maxWidth: 400,
    width: '90%',
  },

  modalContentLarge: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 20,
    ...StyleUtils.createShadow(12),
    maxWidth: 500,
    width: '90%',
  },
});

// 🎨 애니메이션 스타일 패턴들
export const Animations = StyleSheet.create({
  particleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  relicContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  comboContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  stageTransition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  judgement: {
    position: 'absolute',
    bottom: 50,
  },

  sparkle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// 📊 통계/정보 스타일 패턴들
export const Stats = StyleSheet.create({
  statsContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 15,
    ...StyleUtils.createShadow(3),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 5,
  },

  infoCard: {
    backgroundColor: Colors.primary.lightest,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
    marginTop: 10,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

// 🎯 공통 유틸리티 스타일들
export const Utils = StyleSheet.create({
  // 정렬
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
  },

  column: {
    flexDirection: 'column',
  },

  // 간격
  gap5: { gap: 5 },
  gap10: { gap: 10 },
  gap15: { gap: 15 },
  gap20: { gap: 20 },

  // 마진
  margin5: { margin: 5 },
  margin10: { margin: 10 },
  margin15: { margin: 15 },
  margin20: { margin: 20 },

  marginHorizontal5: { marginHorizontal: 5 },
  marginHorizontal10: { marginHorizontal: 10 },
  marginHorizontal15: { marginHorizontal: 15 },
  marginHorizontal20: { marginHorizontal: 20 },

  marginVertical5: { marginVertical: 5 },
  marginVertical10: { marginVertical: 10 },
  marginVertical15: { marginVertical: 15 },
  marginVertical20: { marginVertical: 20 },

  // 패딩
  padding5: { padding: 5 },
  padding10: { padding: 10 },
  padding15: { padding: 15 },
  padding20: { padding: 20 },

  paddingHorizontal5: { paddingHorizontal: 5 },
  paddingHorizontal10: { paddingHorizontal: 10 },
  paddingHorizontal15: { paddingHorizontal: 15 },
  paddingHorizontal20: { paddingHorizontal: 20 },

  paddingVertical5: { paddingVertical: 5 },
  paddingVertical10: { paddingVertical: 10 },
  paddingVertical15: { paddingVertical: 15 },
  paddingVertical20: { paddingVertical: 20 },

  // 보더
  borderRadius8: { borderRadius: 8 },
  borderRadius12: { borderRadius: 12 },
  borderRadius16: { borderRadius: 16 },
  borderRadius20: { borderRadius: 20 },

  // 그림자 - StyleUtils 활용
  shadowSmall: StyleUtils.createShadow(2),
  shadowMedium: StyleUtils.createShadow(3),
  shadowLarge: StyleUtils.createShadow(5),
});

// 🎮 게임 관련 스타일 패턴들
export const GameStyles = StyleSheet.create({
  // 게임 컨테이너
  gameContainer: {
    flex: 1,
    padding: 20,
  },

  // 게임 헤더
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  // 미니 아바타 컨테이너
  miniAvatarContainer: {
    flex: 0.3,
    alignItems: 'center',
  },

  // 점수판
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...StyleUtils.createShadow(3),
  },

  scoreItem: {
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 5,
  },

  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  comboValue: {
    color: Colors.status.error,
  },

  perfectValue: {
    color: Colors.accent.main,
  },

  maxComboValue: {
    color: Colors.primary.dark,
  },

  // 소리 영역
  soundArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    marginBottom: 20,
    ...StyleUtils.createShadow(3),
    padding: 20,
  },

  soundText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },

  // 진행률 바
  progressContainer: {
    marginBottom: 15,
  },

  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral.light,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 4,
  },

  // 랭크 시스템
  rankProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rankPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginRight: 10,
  },

  rankBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.neutral.light,
    borderRadius: 3,
    overflow: 'hidden',
  },

  rankFill: {
    height: '100%',
    borderRadius: 3,
  },

  // 기타 게임 스타일
  stats: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 15,
    ...StyleUtils.createShadow(3),
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 5,
  },

  // 
  thresholdModeContainer: {
    alignItems: 'center',
    padding: 20,
  },

  thresholdTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.accent.main,
    marginBottom: 10,
  },

  thresholdVolume: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 10,
  },

  thresholdInstruction: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  volumeGauge: {
    width: 200,
    height: 12,
    backgroundColor: Colors.neutral.light,
    borderRadius: 6,
    overflow: 'hidden',
  },

  volumeFill: {
    height: '100%',
    backgroundColor: Colors.accent.main,
    borderRadius: 6,
  },

  thresholdButtons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },

  // 밸런스 테스트 모드 스타일
  balanceModeContainer: {
    alignItems: 'center',
    padding: 20,
  },

  balanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.status.warning,
    marginBottom: 10,
  },

  balanceInstruction: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  balanceEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },

  balanceButtons: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },

  // 스테레오 테스트 컨테이너
  stereoTestContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    justifyContent: 'center',
  },

  // 밸런스 게임 버튼들
  balanceGameButtons: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
    justifyContent: 'center',
  },

  // 밸런스 현재 소리
  balanceCurrentSound: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.status.warning,
    textAlign: 'center',
    marginBottom: 10,
  },

  // 게임 시작 버튼
  startGameButton: {
    backgroundColor: Colors.status.success,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    ...StyleUtils.createShadow(3),
    marginTop: 20,
  },

  startGameButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 밸런스 점수
  balanceScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.status.warning,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Additional missing game styles
  burstAnimation: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  burstText: {
    fontSize: 200,
    color: Colors.accent.main,
    ...StyleUtils.createShadow(5),
  },

  answerButton: {
    borderRadius: 12,
    padding: 20,
    minWidth: 120,
    ...StyleUtils.createShadow(3),
  },
});
