import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    Easing
} from "react-native-reanimated";
import { BurstAnimation, JudgementAnimation, ParticleExplosion } from '@/components/animations';
import { GameResultModal } from "@/components/GameResultModal";
import { LevelUpModal } from "@/components/LevelUpModal";
import RewardModal from "@/components/RewardModal";
import {
  DifficultyLevel,
  QuestionCount,
  GameResult,
  MAX_SETS,
  SoundSpeed,
  SOUND_SPEED_CONFIG
} from "@/types/game";
import useGameLogic from "@/hooks/useGameLogic";
import { GameHeader, GameSettingsSection, GameGamificationCard, GameStartButton } from "@/components/game";
import { Layout, Cards, Typography, Buttons, Utils, Colors, GameStyles } from '@/constants/GlobalStyles';

// 🎵 소리 분별 훈련 타입 정의
type DiscriminationMode = 'pitch' | 'duration' | 'word-pair';
type SoundPair = {
    sound1: string;
    sound2: string;
    areSame: boolean;
    type: 'pitch' | 'duration';
};

type WordPair = {
    word1: string;
    word2: string;
    areSame: boolean;
    difficulty: 'easy' | 'medium' | 'hard'; // 발음 차이 정도
};

// 🎵 소리 데이터 (실제로는 음성 파일을 사용하겠지만, 지금은 텍스트로 시뮬레이션)
const PITCH_PAIRS: SoundPair[] = [
    { sound1: "높은음 🎵", sound2: "낮은음 🎶", areSame: false, type: 'pitch' },
    { sound1: "높은음 🎵", sound2: "높은음 🎵", areSame: true, type: 'pitch' },
    { sound1: "중간음 🎼", sound2: "낮은음 🎶", areSame: false, type: 'pitch' },
    { sound1: "중간음 🎼", sound2: "중간음 🎼", areSame: true, type: 'pitch' },
];

const DURATION_PAIRS: SoundPair[] = [
    { sound1: "짧은소리 ♪", sound2: "긴소리 ♫♫♫", areSame: false, type: 'duration' },
    { sound1: "긴소리 ♫♫♫", sound2: "긴소리 ♫♫♫", areSame: true, type: 'duration' },
    { sound1: "중간소리 ♪♪", sound2: "짧은소리 ♪", areSame: false, type: 'duration' },
    { sound1: "중간소리 ♪♪", sound2: "중간소리 ♪♪", areSame: true, type: 'duration' },
];

const WORD_PAIRS: WordPair[] = [
    // 🟢 쉬움: 자음이 완전히 다름
    { word1: "곰", word2: "공", areSame: false, difficulty: 'easy' },
    { word1: "차", word2: "자", areSame: false, difficulty: 'easy' },
    { word1: "밥", word2: "팝", areSame: false, difficulty: 'easy' },
    { word1: "물", word2: "불", areSame: false, difficulty: 'easy' },
    { word1: "집", word2: "집", areSame: true, difficulty: 'easy' },
    { word1: "책", word2: "책", areSame: true, difficulty: 'easy' },

    // 🟡 보통: 자음 하나만 다름 (ㄱ/ㅋ, ㄷ/ㅌ, ㅂ/ㅍ 등)
    { word1: "가방", word2: "카방", areSame: false, difficulty: 'medium' },
    { word1: "다리", word2: "타리", areSame: false, difficulty: 'medium' },
    { word1: "바다", word2: "파다", areSame: false, difficulty: 'medium' },
    { word1: "고기", word2: "코기", areSame: false, difficulty: 'medium' },
    { word1: "사과", word2: "사과", areSame: true, difficulty: 'medium' },
    { word1: "나무", word2: "나무", areSame: true, difficulty: 'medium' },

    // 🔴 어려움: 미세한 차이 (받침, 장단음)
    { word1: "빛", word2: "빗", areSame: false, difficulty: 'hard' },
    { word1: "밤", word2: "밥", areSame: false, difficulty: 'hard' },
    { word1: "눈", word2: "눈", areSame: true, difficulty: 'hard' }, // 동음이의어
    { word1: "말", word2: "맘", areSame: false, difficulty: 'hard' },
    { word1: "길", word2: "김", areSame: false, difficulty: 'hard' },
    { word1: "꽃", word2: "꽃", areSame: true, difficulty: 'hard' },
];

function DiscriminationTraining() {
    const insets = useSafeAreaInsets();

    // 🎮 공통 게임 로직 사용
    const gameLogic = useGameLogic({
        questionCount: 10,
        difficulty: 'normal',
        soundSpeed: 'normal',
        trainingMode: 'pitch',
    });

    const {
        settings,
        setSettings,
        showSettings,
        setShowSettings,
        gameState,
        avatarProgress,
        currentLevelInfo,
        nextLevelInfo,
        levelProgress,
        isLeveledUp,
        newLevelInfo,
        addPerfects,
        closeLevelUpModal,
        startGame,
        finishSet,
        continueGame,
        resetGame,
        updateScore,
        updateCombo,
        updateSettings,
    } = gameLogic;
    const [mode, setMode] = useState<DiscriminationMode>('pitch');

    // 🎯 게임 상태 (공통 로직과 별개로 관리)
    const [currentPair, setCurrentPair] = useState<SoundPair | WordPair | null>(null);
    const [showingFirstSound, setShowingFirstSound] = useState(false);
    const [showingSecondSound, setShowingSecondSound] = useState(false);
    const [canAnswer, setCanAnswer] = useState(false);
    const [judgement, setJudgement] = useState<"Perfect" | "Good" | "Miss" | null>(null);

    // 🏆 결과 모달
    const [showResult, setShowResult] = useState(false);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // 🎨 애니메이션 값
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const judgementScale = useSharedValue(0);
  const judgementOpacity = useSharedValue(0);

  // 🏺 유물 애니메이션 값
  const artifactScale = useSharedValue(0);
  const artifactOpacity = useSharedValue(0);
  const artifactTranslateY = useSharedValue(20);

  // 🏺 게이미피케이션 상태 (유물 조각 시스템)
  const [artifactPieces, setArtifactPieces] = useState(0);
  const [totalArtifactPieces, setTotalArtifactPieces] = useState(0);
  const [showArtifactAnimation, setShowArtifactAnimation] = useState(false);

  // 🎊 유물 완성 보상 모달
  const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);
  const [artifactRewards, setArtifactRewards] = useState<string[]>([]);

    // 🎖️ 랭크 시스템
    const [rankPoints, setRankPoints] = useState(0);
    const [currentRank, setCurrentRank] = useState('초급 청취자');
    const [showRankUpAnimation, setShowRankUpAnimation] = useState(false);

    // 🎆 입자 폭발 애니메이션 상태
    const [showParticleExplosion, setShowParticleExplosion] = useState(false);

    // 랭크 시스템 정의
    const RANKS = [
        { name: '초급 청취자', minPoints: 0, color: '#95A5A6', emoji: '🔰' },
        { name: '발음 감별사', minPoints: 100, color: '#3498DB', emoji: '🎧' },
        { name: '소리 탐정', minPoints: 300, color: '#9B59B6', emoji: '🕵️' },
        { name: '청각 마스터', minPoints: 600, color: '#E67E22', emoji: '🏆' },
        { name: '음성 전문가', minPoints: 1000, color: '#E74C3C', emoji: '👑' },
    ];

    // 게임 시작 (공통 로직에서 가져옴, 추가 로직만 여기에)
    const handleStartGame = () => {
        console.log(`=== 2단계 게임 시작 (${mode} 모드, 세트 ${gameState.currentSet}) ===`);
        startGame();
        setCanAnswer(false);
        setCurrentPair(null);

        // 첫 번째 문제 시작
        setTimeout(() => {
            presentNextPair();
        }, 1000);
    };

    // 다음 문제 제시
    const presentNextPair = () => {
        let pairs: (SoundPair | WordPair)[];

        if (mode === 'pitch') {
            pairs = PITCH_PAIRS;
        } else if (mode === 'duration') {
            pairs = DURATION_PAIRS;
        } else {
            // 단어 모드에서는 게임 난이도에 따라 단어 난이도 필터링
            const wordDifficultyMap = {
                'easy': ['easy'],
                'normal': ['easy', 'medium'],
                'hard': ['easy', 'medium', 'hard']
            };

            const allowedDifficulties = wordDifficultyMap[settings.difficulty as DifficultyLevel];
            pairs = WORD_PAIRS.filter(pair =>
                'difficulty' in pair && allowedDifficulties.includes(pair.difficulty)
            );
        }

        const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
        setCurrentPair(randomPair);
        setCanAnswer(false);

    // 첫 번째 소리 재생
    setShowingFirstSound(true);

    // 설정된 속도에 따라 첫 번째 소리 표시 시간 결정
    const firstSoundDuration = SOUND_SPEED_CONFIG[settings.soundSpeed as SoundSpeed].minInterval * 0.6; // 최소 간격의 60%

    setTimeout(() => {
        setShowingFirstSound(false);

        // 설정된 속도에 따라 두 번째 소리까지 간격 결정
        const secondSoundDelay = SOUND_SPEED_CONFIG[settings.soundSpeed as SoundSpeed].minInterval * 0.4; // 나머지 40%

        // 잠시 간격 후 두 번째 소리 재생
        setTimeout(() => {
            setShowingSecondSound(true);
            setTimeout(() => {
                setShowingSecondSound(false);
                setCanAnswer(true); // 이제 답변 가능
            }, 1500); // 두 번째 소리 표시 시간은 고정
        }, secondSoundDelay);
    }, firstSoundDuration);
    };

    // 답변 처리
    const handleAnswer = useCallback((selected: string) => {
        if (currentPair) {
            // 올바른 정답 확인 로직:
            // 사용자가 'same'을 선택했다면 currentPair.areSame가 true여야 정답
            // 사용자가 'different'를 선택했다면 currentPair.areSame가 false여야 정답
            const isCorrect = (selected === 'same' && currentPair.areSame) ||
                (selected === 'different' && !currentPair.areSame);

            let judgementResult: "Perfect" | "Good" | "Miss";
            let points = 0;

            if (isCorrect) {
                judgementResult = "Perfect";
                points = 100;

                // 콤보 보너스
                const newCombo = gameState.combo + 1;
                if (newCombo === 5) {
                    points += 500;
                } else if (newCombo === 10) {
                    points += 1000;
                }

                updateCombo(true);
                updateScore(points);

                // 🏺 유물 조각 획득 애니메이션
                triggerArtifactPieceAnimation();

                // 🎖️ 랭크 포인트 획득
                updateRankPoints(10); // Perfect 시 10포인트

                // 콤보 보너스
                if (newCombo === 5) {
                    points += 500;
                    updateRankPoints(20); // 콤보 보너스 포인트
                } else if (newCombo === 10) {
                    points += 1000;
                    updateRankPoints(50);
                }

                // 🎆 화려한 입자 폭발 애니메이션 (Perfect 전용)
                triggerParticleExplosion();
                triggerBurstAnimation();
                console.log(`✨ Perfect! +${points}점 | 콤보: ${newCombo}`);
            } else {
                judgementResult = "Miss";
                points = 0;
                updateCombo(false);
                console.log(`💔 Miss! 콤보 초기화`);
            }

            setJudgement(judgementResult);
            setCanAnswer(false);

            // 판정 텍스트 1초 후 제거
            setTimeout(() => setJudgement(null), 1000);

            // 다음 문항으로
            const nextQuestion = gameState.currentQuestion + 1;

            if (nextQuestion >= settings.questionCount) {
                const result: GameResult = {
                    totalQuestions: settings.questionCount,
                    perfectCount: gameState.perfectCount,
                    goodCount: gameState.goodCount,
                    missCount: gameState.missCount,
                    totalScore: gameState.score,
                    maxCombo: gameState.maxCombo,
                    averageReactionTime: 0,
                    completedSets: gameState.currentSet,
                };
                setGameResult(result);
                setTimeout(() => {
                    finishSet(result, true);
                }, 1500);
            } else {
                setTimeout(() => {
                    presentNextPair();
                }, 2000);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPair, gameState, settings.questionCount, judgement, mode, finishSet]);

    // 🏺 유물 조각 획득 애니메이션 (유물 완성 보상 시스템 구현)
    const triggerArtifactPieceAnimation = () => {
        setArtifactPieces(prev => {
            const newCount = prev + 1;

            // 10개 모았을 때 유물 완성 보상 지급
            if (newCount >= 10) {
                const rewards = [
                    '🏺 전설 유물 완성!',
                    '💎 보물 상자 해금',
                    '🎖️ "유물 수집가" 칭호 획득',
                    '⭐ 추가 점수 1000점 보너스'
                ];
                setArtifactRewards(rewards);
                setIsRewardModalVisible(true);

                console.log("🎊 유물 완성! 보상 모달 표시");
            }

            return newCount;
        });
        setTotalArtifactPieces(prev => prev + 1);
        setShowArtifactAnimation(true);

        // 🏺 새로운 유물 발견 애니메이션 실행
        triggerArtifactAnimation();

        setTimeout(() => {
            setShowArtifactAnimation(false);
        }, 1000); // 애니메이션 시간 증가
    };

    // 🎆 입자 폭발 애니메이션
    const triggerParticleExplosion = () => {
        setShowParticleExplosion(true);
        setTimeout(() => {
            setShowParticleExplosion(false);
        }, 1200);
    };

    // 🎖️ 랭크 포인트 업데이트
    const updateRankPoints = (points: number) => {
        const newPoints = rankPoints + points;
        setRankPoints(newPoints);

        // 랭크 업 체크
        const newRank = RANKS.slice().reverse().find(rank => newPoints >= rank.minPoints);
        if (newRank && newRank.name !== currentRank) {
            setCurrentRank(newRank.name);
            setShowRankUpAnimation(true);
            setTimeout(() => {
                setShowRankUpAnimation(false);
            }, 3000);
            console.log(`🎖️ 랭크 업! ${newRank.emoji} ${newRank.name}`);
        }
    };

    // 게임 종료 (공통 로직 사용)
    const handleResetGame = () => {
        resetGame();
        setShowResult(false);
        setGameResult(null);
    };

  //  애니메이션 함수
  const triggerBurstAnimation = () => {
    burstScale.value = 0;
    burstOpacity.value = 1;

    burstScale.value = withSpring(1.2, {
      damping: 10,
      stiffness: 100,
    });

    burstOpacity.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  };

  // 🏺 유물 발견 애니메이션
  const triggerArtifactAnimation = () => {
    // 초기화
    artifactScale.value = 0;
    artifactOpacity.value = 0;
    artifactTranslateY.value = 20;

    // 나타나는 애니메이션
    artifactOpacity.value = withTiming(1, { duration: 300 });
    artifactScale.value = withSpring(1.2, { damping: 8, stiffness: 100 });
    artifactTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });

    // 사라지는 애니메이션 (딜레이 후)
    setTimeout(() => {
      artifactScale.value = withTiming(0.8, { duration: 200 });
      artifactOpacity.value = withTiming(0, { duration: 300 });
      artifactTranslateY.value = withTiming(-10, { duration: 300 });
    }, 300);
  };

  const burstAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: burstScale.value }],
      opacity: burstOpacity.value,
    };
  });

  // 🏺 유물 애니메이션 스타일
  const artifactAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: artifactScale.value },
        { translateY: artifactTranslateY.value }
      ],
      opacity: artifactOpacity.value,
    };
  });


    if (gameState.gameStarted) {
        return (
            <View style={[Layout.screenContainer, { paddingTop: insets.top }]}>
                <View style={GameStyles.gameContainer}>
                    {/* 공통 게임 헤더 */}
                    <GameHeader
                        title={mode === 'pitch' ? '🎵 음높이 비교' : mode === 'duration' ? '⏱️ 소리 길이 비교' : '🗣️ 단어 짝 맞추기'}
                        subtitle=""
                        currentLevelInfo={currentLevelInfo}
                        levelProgress={levelProgress}
                        gameStarted={true}
                        currentQuestion={gameState.currentQuestion}
                        totalQuestions={settings.questionCount}
                        currentSet={gameState.currentSet}
                        score={gameState.score}
                        perfectCount={gameState.perfectCount}
                        combo={gameState.combo}
                        maxCombo={gameState.maxCombo}
                    />

                    {/* 🏺 유물 조각 진행도 */}
                    <View style={styles.artifactContainer}>
                        <Text style={styles.artifactTitle}>🏺 발굴된 유물 조각</Text>
                        <View style={styles.artifactProgress}>
                            <Text style={styles.artifactCount}>{artifactPieces}/10</Text>
                            <View style={styles.artifactBar}>
                                <View
                                    style={[
                                        styles.artifactFill,
                                        { width: `${(artifactPieces / 10) * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>
                        {showArtifactAnimation && (
                            <Animated.View
                                style={[
                                    styles.artifactAnimationContainer,
                                    artifactAnimatedStyle
                                ]}
                            >
                                <Animated.Text style={styles.artifactAnimation}>
                                    🏺 유물 조각 발견!
                                </Animated.Text>
                                <Animated.Text style={styles.artifactSubAnimation}>
                                    ✨ +1개 획득
                                </Animated.Text>
                            </Animated.View>
                        )}
                    </View>

                    {/* 🎖️ 랭크 정보 */}
                    <View style={styles.rankContainer}>
                        <Text style={styles.rankTitle}>
                            {RANKS.find(rank => rank.name === currentRank)?.emoji} {currentRank}
                        </Text>
                        <View style={styles.rankProgress}>
                            <Text style={styles.rankPoints}>{rankPoints}P</Text>
                            <View style={styles.rankBar}>
                                <View
                                    style={[
                                        styles.rankFill,
                                        {
                                            width: `${Math.min(100, (rankPoints / (RANKS.find(rank => rank.name === currentRank)?.minPoints || 1000)) * 100)}%`,
                                            backgroundColor: RANKS.find(rank => rank.name === currentRank)?.color || '#95A5A6'
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                        {showRankUpAnimation && (
                            <Animated.Text style={styles.rankUpAnimation}>
                                🎖️ 랭크 업! {RANKS.find(rank => rank.name === currentRank)?.emoji}
                            </Animated.Text>
                        )}
                    </View>


                    {/* 소리 표시 영역 */}
                    <View style={styles.soundArea}>
                        {showingFirstSound && currentPair && (
                            <View style={Utils.center}>
                                <Text style={Typography.cardTitle}>첫 번째 소리</Text>
                                <Text style={Typography.gameTitle}>
                                    {'sound1' in currentPair ? currentPair.sound1 : currentPair.word1}
                                </Text>
                            </View>
                        )}

                        {showingSecondSound && currentPair && (
                            <View style={Utils.center}>
                                <Text style={Typography.cardTitle}>두 번째 소리</Text>
                                <Text style={Typography.gameTitle}>
                                    {'sound2' in currentPair ? currentPair.sound2 : currentPair.word2}
                                </Text>
                            </View>
                        )}

                        {!showingFirstSound && !showingSecondSound && canAnswer && (
                            <Text style={Typography.instruction}>
                                두 소리가 같나요? 다른가요?
                            </Text>
                        )}

                        {/* 🎆 입자 폭발 애니메이션 */}
                        <ParticleExplosion
                            show={showParticleExplosion}
                            particleCount={8}
                            colors={['#FFD700', '#FF6B6B', '#4A90E2', '#9B59B6', '#E67E22', '#2ECC71']}
                            duration={1200}
                            centerX={0}
                            centerY={0}
                        />

                        {/* 판정 텍스트 */}
                        {judgement && (
                            <JudgementAnimation
                                judgement={judgement}
                                duration={1000}
                            />
                        )}
                    </View>

                    {/* 답변 버튼들 */}
                    {canAnswer && (
                        <View style={styles.answerButtons}>
                            <TouchableOpacity
                                style={[styles.sameButton, styles.answerButton]}
                                onPress={() => handleAnswer('same')}
                            >
                                <Text style={styles.answerButtonText}>같음 ✓</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.differentButton, styles.answerButton]}
                                onPress={() => handleAnswer('different')}
                            >
                                <Text style={styles.answerButtonText}>다름 ✗</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 종료 버튼 */}
                    <TouchableOpacity style={styles.stopButton} onPress={resetGame}>
                        <Text style={styles.stopButtonText}>게임 종료</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[Layout.screenContainer, { paddingTop: insets.top }]}>
            {/* 햄버거 메뉴 버튼 */}
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowSettings(true)}
            >
                <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>

            <ScrollView style={Layout.scrollContainer}>
                {/* 공통 게임 헤더 (메인 화면용) */}
                <GameHeader
                    title="청능 훈련 - 2단계"
                    subtitle="소리 분별 훈련"
                    currentLevelInfo={currentLevelInfo}
                    levelProgress={levelProgress}
                    gameStarted={false}
                    currentQuestion={0}
                    totalQuestions={0}
                    currentSet={1}
                />

                {/* 훈련 모드 선택 */}
                <GameSettingsSection
                    title="🎯 훈련 모드 선택"
                    modes={[
                        {
                            key: 'pitch',
                            title: '🎵 음높이 비교',
                            description: '높은음과 낮은음을 구별하는 훈련',
                        },
                        {
                            key: 'duration',
                            title: '⏱️ 소리 길이 비교',
                            description: '짧은 소리와 긴 소리를 구별하는 훈련',
                        },
                        {
                            key: 'word-pair',
                            title: '🗣️ 단어 짝 맞추기',
                            description: '비슷한 발음의 단어들을 구별하는 훈련',
                        }
                    ]}
                    selectedMode={mode}
                    onModeSelect={(mode: string) => setMode(mode as DiscriminationMode)}
                />

                {/* 🏺 게이미피케이션 설명 */}
                <GameGamificationCard
                    title="🏺 고고학자 발굴 미션"
                    content={`• 정답을 맞힐 때마다 유물 조각을 발견합니다\n• 조각 10개를 모으면 하나의 유물이 완성됩니다\n• 유물 완성 시 특별한 보상과 다음 단계 해금!\n• 현재 발굴된 조각: ${totalArtifactPieces}개`}
                />

                {/* 시작 버튼 */}
                <GameStartButton
                    title={`🎮 ${mode === 'pitch' ? '음높이' : mode === 'duration' ? '소리길이' : '단어'} 훈련 시작하기`}
                    onPress={handleStartGame}
                />
            </ScrollView>

            {/* 결과 모달 */}
            {gameResult && (
                <GameResultModal
                    visible={showResult}
                    result={gameResult}
                    onContinue={continueGame}
                    onFinish={handleResetGame}
                    canContinue={gameState.currentSet < MAX_SETS}
                    currentSet={gameState.currentSet}
                    maxSets={MAX_SETS}
                    totalPerfects={avatarProgress.totalPerfects}
                />
            )}

            {/* 🎊 레벨업 모달 */}
            {newLevelInfo && (
                <LevelUpModal
                    visible={isLeveledUp}
                    newLevel={newLevelInfo}
                    onClose={closeLevelUpModal}
                />
            )}

            {/* 🎊 유물 완성 보상 모달 */}
            <RewardModal
                visible={isRewardModalVisible}
                onClose={() => setIsRewardModalVisible(false)}
                rewards={artifactRewards}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // 메뉴 관련 스타일들
    menuButton: {
        ...Buttons.secondary,
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    menuIcon: {
        ...Typography.icon,
        color: Colors.primary.main,
    },

    // 게임 특화 스타일들
    perfectValue: {
        color: Colors.accent.main,
    },
    masterValue: {
        color: Colors.primary.main,
    },

    // 유물 조각 관련 스타일
    artifactFill: {
        height: '100%',
        backgroundColor: Colors.accent.main,
        borderRadius: 3,
    },
    artifactAnimationContainer: {
        position: 'absolute',
        top: -20,
        right: 10,
        alignItems: 'center',
        backgroundColor: Colors.accent.lightest,
        borderRadius: 15,
        padding: 8,
        borderWidth: 1,
        borderColor: Colors.accent.main,
    },
    artifactAnimation: {
        ...Typography.body,
        color: Colors.accent.main,
        fontWeight: 'bold',
   
    },
    artifactSubAnimation: {
        ...Typography.caption,
        color: Colors.accent.dark,
        marginTop: 2,
    },

    // 랭크 관련 스타일
    rankContainer: {
        ...Cards.default,
        borderWidth: 2,
        borderColor: Colors.border.default,
    },
    rankProgress: {
        ...GameStyles.rankProgress,
    },
    rankPoints: {
        ...Typography.body,
        color: Colors.neutral.dark,
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
    rankUpAnimation: {
        position: 'absolute',
        top: -10,
        left: 10,
        ...Typography.body,
        color: Colors.status.error,
    },

    // 답변 버튼 스타일
    answerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    answerButton: {
        ...Buttons.game,
        minWidth: 120,
    },
    sameButton: {
        ...Buttons.success,
    },
    differentButton: {
        ...Buttons.error,
    },
    answerButtonText: {
        ...Typography.buttonLarge,
    },

    // 종료 버튼 스타일
    stopButton: {
        ...Buttons.disabled,
    },
    stopButtonText: {
        ...Typography.button,
    },

    // 유물 조각 관련 스타일
    artifactContainer: {
        ...Cards.default,
        marginBottom: 15,
    },
    artifactTitle: {
        ...Typography.cardTitle,
    },
    artifactProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    artifactCount: {
        ...Typography.body,
        marginRight: 10,
    },
    artifactBar: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.neutral.light,
        borderRadius: 4,
        overflow: 'hidden',
    },

    // 랭크 관련 스타일
    rankTitle: {
        ...Typography.cardTitle,
    },

    // 소리 영역 스타일
    soundArea: {
        ...GameStyles.soundArea,
    },
});

export default DiscriminationTraining;
