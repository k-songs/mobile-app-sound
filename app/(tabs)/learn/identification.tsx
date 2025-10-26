import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
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
import {
    DifficultyLevel,
    QuestionCount,
    GameResult,
    MAX_SETS,
    SoundSpeed,
    SOUND_SPEED_CONFIG
} from "@/types/game";
import { useTrainingGame } from "@/hooks/useTrainingGame";
import { useAvatarProgress } from "@/hooks/useAvatarProgress";
import { GameHeader, GameSettingsSection, GameGamificationCard, GameStartButton } from "@/components/game";
import { Layout, Cards, Typography, Buttons, Modals, GameStyles, Colors, Utils } from '@/constants/GlobalStyles';

// 🎵 소리 식별 훈련 타입 정의
type IdentificationMode = 'word-challenge' | 'sound-identification' | 'voice-recording';

type WordChallenge = {
    word: string;
    pronunciation: string; // 실제 발음 표시용
    category: 'common' | 'intermediate' | 'advanced';
    hint?: string; // 힌트 추가
};


// 🎵 단어 챌린지 데이터 (100개 핵심 단어)
const WORD_CHALLENGES: WordChallenge[] = [
    // 🟢 초급 단어 (자주 사용) - 20개
    { word: "사과", pronunciation: "sa-gwa", category: 'common', hint: "빨간색이나 초록색 과일" },
    { word: "학교", pronunciation: "hak-gyo", category: 'common', hint: "공부하는 곳" },
    { word: "물", pronunciation: "mul", category: 'common', hint: "투명하고 마실 수 있는 액체" },
    { word: "바람", pronunciation: "ba-ram", category: 'common', hint: "움직이는 공기" },
    { word: "집", pronunciation: "jip", category: 'common', hint: "살고 있는 장소" },
    { word: "강아지", pronunciation: "gang-a-ji", category: 'common', hint: "짖는 동물" },
    { word: "고양이", pronunciation: "go-yang-i", category: 'common', hint: "야옹 소리를 내는 동물" },
    { word: "친구", pronunciation: "chin-gu", category: 'common', hint: "함께 놀고 이야기하는 사람" },
    { word: "가족", pronunciation: "ga-jok", category: 'common', hint: "함께 사는 사람들" },
    { word: "음식", pronunciation: "eum-sik", category: 'common', hint: "먹을 수 있는 것" },
    { word: "자동차", pronunciation: "ja-dong-cha", category: 'common', hint: "길을 달리는 탈 것" },
    { word: "전화", pronunciation: "jeon-hwa", category: 'common', hint: "통화하는 기계" },
    { word: "책", pronunciation: "chaek", category: 'common', hint: "읽을 수 있는 종이" },
    { word: "연필", pronunciation: "yeon-pil", category: 'common', hint: "글씨를 쓰는 도구" },
    { word: "의자", pronunciation: "ui-ja", category: 'common', hint: "앉을 수 있는 가구" },
    { word: "테이블", pronunciation: "te-i-beul", category: 'common', hint: "음식을 먹는 평평한 곳" },
    { word: "창문", pronunciation: "chang-mun", category: 'common', hint: "빛이 들어오는 유리" },
    { word: "문", pronunciation: "mun", category: 'common', hint: "방이나 건물에 있는 입구" },
    { word: "손", pronunciation: "son", category: 'common', hint: "손가락이 있는 신체 부위" },
    { word: "발", pronunciation: "bal", category: 'common', hint: "걷는 데 사용하는 신체 부위" },

    // 🟡 중급 단어 (덜 자주 사용) - 15개
    { word: "컴퓨터", pronunciation: "keom-pyu-teo", category: 'intermediate', hint: "정보를 처리하는 전자 기기" },
    { word: "도서관", pronunciation: "do-seo-gwan", category: 'intermediate', hint: "책을 빌리고 읽을 수 있는 곳" },
    { word: "병원", pronunciation: "byeong-won", category: 'intermediate', hint: "아픈 사람이 치료받는 곳" },
    { word: "은행", pronunciation: "eun-haeng", category: 'intermediate', hint: "돈을 관리하는 곳" },
    { word: "시장", pronunciation: "si-jang", category: 'intermediate', hint: "물건을 사고파는 장소" },
    { word: "식당", pronunciation: "sik-dang", category: 'intermediate', hint: "음식을 먹을 수 있는 곳" },
    { word: "공항", pronunciation: "gong-hang", category: 'intermediate', hint: "비행기를 타고 내리는 곳" },
    { word: "기차역", pronunciation: "gi-cha-yeok", category: 'intermediate', hint: "기차를 타고 내리는 곳" },
    { word: "대학교", pronunciation: "dae-hak-gyo", category: 'intermediate', hint: "고등 교육을 받는 곳" },
    { word: "회사", pronunciation: "hoe-sa", category: 'intermediate', hint: "일하는 장소" },
    { word: "아파트", pronunciation: "a-pa-teu", category: 'intermediate', hint: "여러 가구가 사는 건물" },
    { word: "마트", pronunciation: "ma-teu", category: 'intermediate', hint: "식료품을 사는 곳" },
    { word: "카페", pronunciation: "ka-pe", category: 'intermediate', hint: "커피와 음료를 마시는 곳" },
    { word: "영화관", pronunciation: "yeong-hwa-gwan", category: 'intermediate', hint: "영화를 보는 곳" },
    { word: "체육관", pronunciation: "che-yuk-gwan", category: 'intermediate', hint: "운동할 수 있는 실내 공간" },

    // 🔴 고급 단어 (희귀 단어) - 10개
    { word: "현대인", pronunciation: "hyeon-dae-in", category: 'advanced', hint: "현대 사회에 살고 있는 사람" },
    { word: "문화재", pronunciation: "mun-hwa-jae", category: 'advanced', hint: "역사적, 예술적 가치가 있는 것" },
    { word: "민주주의", pronunciation: "min-ju-ju-ui", category: 'advanced', hint: "국민이 주인인 정치 체제" },
    { word: "자유시장경제", pronunciation: "ja-yu-si-jang-gyeong-je", category: 'advanced', hint: "자유롭게 경제 활동을 하는 체제" },
    { word: "환경오염", pronunciation: "hwan-gyeong-o-yeom", category: 'advanced', hint: "자연 환경이 더러워지는 현상" },
    { word: "기후변화", pronunciation: "gi-hu-byeon-hwa", category: 'advanced', hint: "지구 온도와 기후가 변하는 현상" },
    { word: "인공지능", pronunciation: "in-gong-ji-neung", category: 'advanced', hint: "사람처럼 생각하는 기계" },
    { word: "양자역학", pronunciation: "yang-ja-yeok-hak", category: 'advanced', hint: "아주 작은 세계의 물리학" },
    { word: "나노기술", pronunciation: "na-no-gi-sul", category: 'advanced', hint: "아주 작은 크기의 기술" },
    { word: "생명공학", pronunciation: "saeng-myeong-gong-hak", category: 'advanced', hint: "생명을 연구하고 응용하는 학문" },
];


// 음성 녹음 데이터 타입
type VoiceRecording = {
    id: string;
    name: string;
    duration: number;
    createdAt: Date;
    audioUri?: string;
};

function IdentificationTraining() {
    const insets = useSafeAreaInsets();

    // 🎮 공통 게임 로직 사용
    const gameLogic = useTrainingGame();

    const {
        gameState,
        settings,
        setSettings,
        startGame,
        resetGame,
        handleSoundCatch,
        isGameComplete,
        calculateAccuracy,
        selectGameState
    } = gameLogic;

    // Avatar Progress
    const {
        progress: avatarProgress,
        currentLevelInfo,
        nextLevelInfo,
        levelProgress,
        isLeveledUp,
        newLevelInfo,
        addPerfects,
        closeLevelUpModal,
    } = useAvatarProgress();

    // 식별 훈련 전용 함수들
    const finishSet = useCallback((result: GameResult, showResult: boolean = true) => {
        // 아바타 진행도 업데이트
        const accuracy = (result.perfectCount / result.totalQuestions) * 100;
        addPerfects(result.perfectCount, accuracy);

        if (showResult) {
            console.log('식별 훈련 완료:', result);
        }
    }, [addPerfects]);

    const updateScore = useCallback((points: number) => {
        // 식별 훈련 점수 업데이트 로직
        console.log('점수 업데이트:', points);
    }, []);

    const updateCombo = useCallback((isCorrect: boolean) => {
        // 식별 훈련 콤보 업데이트 로직
        console.log('콤보 업데이트:', isCorrect);
    }, []);

    // 추가 상태 관리
    const [showSettings, setShowSettings] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

    const continueGame = useCallback(() => {
        setShowResult(false);
        startGame();
    }, [startGame]);

    const [mode, setMode] = useState<IdentificationMode>('word-challenge');

    // 🏆 청각 나무 성장 시스템
    const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
    const [soundMuseum, setSoundMuseum] = useState<Set<string>>(new Set());
    const [treeStage, setTreeStage] = useState<'seedling' | 'sapling' | 'tree' | 'golden'>('seedling');

    // 🎯 게임 상태 (공통 로직과 별개로 관리)
    const [currentChallenge, setCurrentChallenge] = useState<any>(null);
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    // 🎨 애니메이션 상태
    const [showParticleExplosion, setShowParticleExplosion] = useState(false);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const treeScale = useSharedValue(1);
    const treeOpacity = useSharedValue(1);

    // 🎤 음성 녹음 상태
    const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);

    // 청각 나무 성장 로직
    const updateTreeGrowth = (newMasteredCount: number) => {
        if (newMasteredCount >= 80) {
            setTreeStage('golden');
        } else if (newMasteredCount >= 50) {
            setTreeStage('tree');
        } else if (newMasteredCount >= 25) {
            setTreeStage('sapling');
        } else {
            setTreeStage('seedling');
        }
    };

    // 게임 시작 (공통 로직에서 가져옴, 추가 로직만 여기에)
    const handleStartGame = () => {
        console.log(`=== 3단계 게임 시작 (${mode} 모드, 세트 ${gameState.currentSet}) ===`);
        startGame();
        setTimeout(() => presentNextChallenge(), 1000);
    };

    // 다음 챌린지 제시
    const presentNextChallenge = () => {
        let challenge: any;

        if (mode === 'word-challenge') {
            // 난이도별 단어 필터링
            const availableWords = WORD_CHALLENGES.filter(word =>
                settings.difficulty === 'easy' ? word.category === 'common' :
                settings.difficulty === 'normal' ? ['common', 'intermediate'].includes(word.category) :
                true
            );
            challenge = availableWords[Math.floor(Math.random() * availableWords.length)];
        } else {
            // 생활 소음 (현재 비활성화됨)
            // challenge = SOUND_CHALLENGES[Math.floor(Math.random() * SOUND_CHALLENGES.length)];
            // 임시로 단어 챌린지로 대체
            const availableSentences = WORD_CHALLENGES.filter(word =>
                settings.difficulty === 'easy' ? word.category === 'common' :
                settings.difficulty === 'normal' ? ['common', 'intermediate'].includes(word.category) :
                true
            );
            challenge = availableSentences[Math.floor(Math.random() * availableSentences.length)];
        }

        setCurrentChallenge(challenge);
        setUserInput('');
    };

    // 한글 입력 상태 관리를 위한 추가 상태
    const [isComposing, setIsComposing] = useState(false);

    // 한글 입력 핸들러 최적화
    const handleTextChange = useCallback((text: string) => {
        // 조합 중인 텍스트 처리
        setUserInput(text);
    }, []);

    // 음성 녹음 관련 함수들
    const startRecording = async () => {
        try {
            setIsRecording(true);
            const newRecording: VoiceRecording = {
                id: `recording_${Date.now()}`,
                name: `녹음 ${recordings.length + 1}`,
                duration: 0,
                createdAt: new Date(),
            };
            setCurrentRecording(newRecording);
            console.log('🎤 녹음 시작');
        } catch (error) {
            console.error('녹음 시작 중 오류:', error);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            if (currentRecording) {
                const updatedRecording: VoiceRecording = {
                    ...currentRecording,
                    duration: 10, // 임시 고정 값 (실제로는 녹음 길이 계산 필요)
                };
                setRecordings(prev => [...prev, updatedRecording]);
                setCurrentRecording(null);
                console.log('🎤 녹음 완료:', updatedRecording);
            }
        } catch (error) {
            console.error('녹음 중지 중 오류:', error);
        }
    };

    const playRecording = (recording: VoiceRecording) => {
        if (currentRecording) {
            console.log(`🔊 녹음 재생: ${currentRecording.name}`);
            // 실제 오디오 재생 로직 추가 필요
        }
    };

    const deleteRecording = (recordingId: string) => {
        setRecordings(prev => prev.filter(r => r.id !== recordingId));
    };

    // 입력 완료 핸들러
    const handleInputSubmit = useCallback(() => {
        if (!currentChallenge || !userInput.trim()) return;

        // 사용자 입력을 그대로 비교 (간단한 접근)
        const userAnswer = userInput.trim();
        const correctAnswer = currentChallenge.word.trim();

        // 완전 일치 비교
        const correct = userAnswer === correctAnswer;

        console.log(`📝 답변 확인: "${userInput}" vs 정답: "${correctAnswer}" -> ${correct ? '정확함' : '틀림'}`);

        setIsCorrect(correct);

        if (correct) {
            updateCombo(true);
            updateScore(100);

            // 🏆 게이미피케이션 업데이트
            if (mode === 'word-challenge') {
                const newMastered = new Set(masteredWords);
                newMastered.add(currentChallenge.word);
                setMasteredWords(newMastered);
                updateTreeGrowth(newMastered.size);
            }

            // 🎆 성공 애니메이션
            setShowParticleExplosion(true);
            setTimeout(() => setShowParticleExplosion(false), 1200);
        } else {
            updateCombo(false);
            // 틀린 답변의 경우 힌트를 보여줌
            Alert.alert(
                '틀린 답변',
                `정확한 답변: "${correctAnswer}"\n\n힌트: ${currentChallenge.hint || '다시 한 번 생각해보세요'}`,
                [{ text: '다시 시도', style: 'default' }]
            );
        }

        setShowResult(true);

        // 결과 표시 후 다음 문제
        setTimeout(() => {
            setShowResult(false);
            setUserInput(''); // 입력창 초기화

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
                finishSet(result, true);
            } else {
                setTimeout(() => presentNextChallenge(), 1000);
            }
        }, 2000);
    }, [currentChallenge, userInput, mode, masteredWords, gameState, settings.questionCount, finishSet]);

    // 게임 종료 (공통 로직 사용)
    const handleResetGame = () => {
        resetGame();
        setShowResult(false);
        setGameResult(null);
    };

    // 소리 재생 기능 (시뮬레이션)
    const playSound = useCallback(() => {
        if (isPlayingSound || !currentChallenge) {
            console.log('❌ 소리 재생 불가:', { isPlayingSound, hasChallenge: !!currentChallenge });
            return;
        }

        setIsPlayingSound(true);
        console.log('🔊 소리 재생 시작:', currentChallenge);

        // 실제 오디오 재생 시뮬레이션 (나중에 실제 오디오 파일로 교체 가능)
        setTimeout(() => {
            setIsPlayingSound(false);
            console.log('🔊 소리 재생 완료');
        }, 2000); // 2초 재생 시뮬레이션
    }, [isPlayingSound, currentChallenge]);

    // 청각 나무 애니메이션
    const triggerTreeAnimation = () => {
        treeScale.value = 1;
        treeOpacity.value = 1;

        treeScale.value = withSequence(
            withSpring(1.2, { damping: 8 }),
            withSpring(1.0, { damping: 10 })
        );
    };

    const treeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: treeScale.value }],
        opacity: treeOpacity.value,
    }));

    if (gameState.gameStarted) {
        return (
            <View style={[Layout.screenContainer, { paddingTop: insets.top }]}>
                <View style={GameStyles.gameContainer}>
                    {/* 공통 게임 헤더 */}
                    <GameHeader
                        title={mode === 'word-challenge' ? '🔤 단어 식별' : '🔊 소음 식별 (준비 중)'}
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

                    {/* 🏆 청각 나무 성장 표시 */}
                    <View style={Cards.success}>
                        <Text style={Typography.cardTitle}>🌳 청각 나무 성장</Text>
                        <Animated.View style={[Utils.center, treeAnimatedStyle]}>
                            <Text style={styles.treeEmoji}>
                                {treeStage === 'seedling' ? '🌱' :
                                 treeStage === 'sapling' ? '🌿' :
                                 treeStage === 'tree' ? '🌳' : '🌟'}
                            </Text>
                            <Text style={styles.treeStage}>
                                {treeStage === 'seedling' ? '새싹' :
                                 treeStage === 'sapling' ? '작은 나무' :
                                 treeStage === 'tree' ? '큰 나무' : '황금 나무'}
                            </Text>
                        </Animated.View>
                        <Text style={Typography.cardContent}>
                            마스터 단어: {masteredWords.size}/100개
                        </Text>
                    </View>

                    {/* 챌린지 영역 */}
                    <View style={GameStyles.soundArea}>
                        {currentChallenge && (
                            <>
                                {/* 소리 재생 영역 */}
                                <TouchableOpacity
                                    style={[
                                        Buttons.primary,
                                        isPlayingSound && Buttons.disabled
                                    ]}
                                    onPress={playSound}
                                    disabled={isPlayingSound}
                                >
                                    <Text style={Typography.button}>
                                        {isPlayingSound ? '🔊 재생 중...' : '🔊 소리 듣기'}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={Typography.instruction}>
                                    {mode === 'word-challenge' ? '단어를 입력하세요' :
                                     '소음이 무엇인지 입력하세요 (준비 중)'}
                                </Text>
                                {currentChallenge && (
                                    <Text style={Typography.hint}>
                                        {mode === 'word-challenge' ? '힌트: 발음 기호를 참고하세요' :
                                         '힌트: 생활 소리를 상상해보세요 (준비 중)'}
                                    </Text>
                                )}

                                {/* 답변 입력 영역 */}
                                <View style={Utils.center}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={userInput}
                                        onChangeText={setUserInput}
                                        placeholder="답변을 입력하세요"
                                        placeholderTextColor="#999"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleInputSubmit}
                                        blurOnSubmit={true}
                                    />
                                    <TouchableOpacity
                                        style={[
                                            Buttons.success,
                                            !userInput.trim() && Buttons.disabled
                                        ]}
                                        onPress={handleInputSubmit}
                                        disabled={!userInput.trim()}
                                    >
                                        <Text style={Typography.button}>제출</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
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
                    </View>

                    {/* 종료 버튼 */}
                    <TouchableOpacity style={Buttons.disabled} onPress={resetGame}>
                        <Text style={Typography.button}>게임 종료</Text>
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

            <ScrollView style={Layout.scrollContainer} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                {/* 공통 게임 헤더 (메인 화면용) */}
                <GameHeader
                    title="청능 훈련 - 3단계"
                    subtitle="소리 식별 훈련"
                    currentLevelInfo={currentLevelInfo}
                    levelProgress={levelProgress}
                    gameStarted={false}
                    currentQuestion={0}
                    totalQuestions={0}
                    currentSet={1}
                />

                {/* 훈련 모드 선택 */}
                <GameSettingsSection
                    title="🎯 식별 훈련 모드 선택"
                    modes={[
                        {
                            key: 'word-challenge',
                            title: '🔤 단어 마스터리 트리',
                            description: '단어를 정확히 식별하고 마스터리 트리에 등록',
                        },
                        {
                            key: 'sound-identification',
                            title: '🔊 소음 박물관',
                            description: '생활 소음을 듣고 정체를 맞추기 (준비 중)',
                            disabled: true,
                        },
                        {
                            key: 'voice-recording',
                            title: '🎙️ 음성 녹음',
                            description: '내 목소리를 녹음하고 재생하기',
                        }
                    ]}
                    selectedMode={mode}
                    onModeSelect={(mode: string) => setMode(mode as IdentificationMode)}
                >
                    {/* 음성 녹음 모드 */}
                    {mode === 'voice-recording' && (
                        <View style={styles.voiceRecordingContainer}>
                            <View style={styles.recordingControls}>
                                <TouchableOpacity
                                    style={[
                                        styles.recordButton,
                                        isRecording && styles.recordingButton
                                    ]}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <Text style={styles.recordButtonText}>
                                        {isRecording ? '🛑 녹음 중지' : '🎤 녹음 시작'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {recordings.length > 0 && (
                                <View style={styles.recordingsList}>
                                    <Text style={styles.recordingsTitle}>📋 내 녹음 목록</Text>
                                    {recordings.map((recording) => (
                                        <View key={recording.id} style={styles.recordingItem}>
                                            <Text style={styles.recordingName}>{recording.name}</Text>
                                            <Text style={styles.recordingDuration}>
                                                {recording.duration}초
                                            </Text>
                                            <View style={styles.recordingActions}>
                                                <TouchableOpacity
                                                    style={styles.playRecordingButton}
                                                    onPress={() => playRecording(recording)}
                                                >
                                                    <Text>▶️</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteRecordingButton}
                                                    onPress={() => deleteRecording(recording.id)}
                                                >
                                                    <Text>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </GameSettingsSection>

                {/* 🏆 게이미피케이션 설명 */}
                <GameGamificationCard
                    title="🌳 청각 나무 성장 시스템"
                    content="• 단어를 정확히 식별할 때마다 나무에 잎사귀가 돋아납니다\n• 문장 완벽 입력 시 열매가 열립니다\n• 소음 정확 식별 시 소리 박물관에 전시됩니다 (준비 중)\n• 나무가 성장함에 따라 새로운 능력이 해금됩니다!"
                />

                {/* 시작 버튼 */}
                <GameStartButton
                    title={`🎮 ${mode === 'word-challenge' ? '단어' : mode === 'voice-recording' ? '음성 녹음' : '소음'} 식별 훈련 시작하기`}
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
        </View>
    );
}

const styles = StyleSheet.create({
    // 메뉴 버튼 (GlobalStyles에 없음)
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

    // 게임 화면 전용 스타일들 (GlobalStyles로 대체 불가한 것들)
    treeEmoji: {
        fontSize: 48,
        marginBottom: 5,
    },
    treeStage: {
        ...Typography.body,
        color: Colors.primary.main,
        fontWeight: '600',
    },
    perfectValue: {
        color: Colors.accent.main,
    },
    masterValue: {
        color: Colors.primary.main,
    },

    // 입력 관련 스타일들
    textInput: {
        width: '80%',
        borderWidth: 2,
        borderColor: Colors.border.default,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: Colors.neutral.white,
    },

    // 음성 녹음 모드 스타일
    voiceRecordingContainer: {
        ...Utils.marginVertical10,
    },
    recordingControls: {
        ...Utils.center,
    },
    recordButton: {
        ...Buttons.success,
        minWidth: 150,
    },
    recordingButton: {
        ...Buttons.warning,
    },
    recordButtonText: {
        ...Typography.button,
    },
    recordingsList: {
        ...Utils.marginVertical10,
    },
    recordingsTitle: {
        ...Typography.cardTitle,
    },
    recordingItem: {
        ...Cards.small,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    recordingName: {
        ...Typography.body,
        flex: 1,
    },
    recordingDuration: {
        ...Typography.caption,
        marginHorizontal: 10,
    },
    recordingActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playRecordingButton: {
        ...Buttons.primarySmall,
        marginRight: 10,
    },
    deleteRecordingButton: {
        ...Buttons.primarySmall,
        backgroundColor: Colors.status.error,
    },
});

export default IdentificationTraining;
