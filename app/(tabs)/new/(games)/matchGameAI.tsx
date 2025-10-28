import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
// [수정] useContext와 useRef를 import 목록에 추가합니다.
import React, { memo, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

// [추가] 새로 만든 컴포넌트와 컨텍스트를 import 합니다.
import MissionProgressIcon from '../../../../components/MissionProgressIcon';
import { ClearContext } from '../../../../context/ClearContext';
import { StarContext } from '../../../../context/StarContext';


// --- (이하 원본 코드와 동일) ---
const SOUNDS_CONFIG = [
    { name: '개', file: require('../../../../assets/sounds/개.mp3') },
    { name: '고양이', file: require('../../../../assets/sounds/고양이.mp3') },
    { name: '늑대', file: require('../../../../assets/sounds/늑대.mp3') },
    { name: '닭', file: require('../../../../assets/sounds/닭.mp3') },
    { name: '돼지', file: require('../../../../assets/sounds/돼지.mp3') },
    { name: '말', file: require('../../../../assets/sounds/말.mp3') },
    { name: '사자', file: require('../../../../assets/sounds/사자.mp3') },
    { name: '소', file: require('../../../../assets/sounds/소.mp3') },
    { name: '염소', file: require('../../../../assets/sounds/염소.mp3') },
    { name: '오리', file: require('../../../../assets/sounds/오리.mp3') },
    { name: '원숭이', file: require('../../../../assets/sounds/원숭이.mp3') },
    { name: '코끼리', file: require('../../../../assets/sounds/코끼리.mp3') },
];
const LEARNING_RATE = 0.1;
const DISCOUNT_FACTOR = 0.9;
const MAX_CHOICES = 3;
const STORAGE_KEY = '@AuditoryTrainingApp:gameState'; // ID가 겹치지 않도록 키를 수정하는 것을 권장합니다. 예: ...AI:gameState

class AudioManager {
    private static instance: AudioManager;
    private sounds = new Map<string, Audio.Sound>();
    private constructor() {}
    public static getInstance(): AudioManager {
        if (!AudioManager.instance) AudioManager.instance = new AudioManager();
        return AudioManager.instance;
    }
    async loadSoundsAsync() {
        if (this.sounds.size > 0) return;
        await Promise.all(SOUNDS_CONFIG.map(async ({ name, file }) => {
            const { sound } = await Audio.Sound.createAsync(file);
            this.sounds.set(name, sound);
        }));
    }
    async playSound(name: string) {
        try {
            await this.sounds.get(name)?.replayAsync();
        } catch(e) {
            console.error(`Error playing sound ${name}:`, e);
        }
    }
}
const audioManager = AudioManager.getInstance();

type GameStatus = 'HOME' | 'LOADING' | 'PLAYING' | 'RESULTS' | 'STATS';
type GameMode = 'STANDARD' | 'WEAKNESS';
type QTable = { [state: string]: { [action: string]: number } };
type UserStats = { [sound: string]: { correct: number; total: number } };

type GameState = {
    status: GameStatus;
    mode: GameMode;
    difficulty: number;
    qTable: QTable;
    userStats: UserStats;
    remainingChoices: number;
    correctSoundNames: Set<string>;
    userSelections: { [key: string]: 'correct' | 'incorrect' };
    score: number;
    roundResult: 'WIN' | 'LOSE' | null;
    // ====[ 미션 추가 1: 미션 달성을 위한 상태 추가 ]====
    hasLostChanceInRun: boolean;
    // ===============================================
};

type Action =
    | { type: 'LOAD_DATA_SUCCESS'; payload: Partial<Pick<GameState, 'difficulty' | 'qTable' | 'userStats'>> }
    | { type: 'LOAD_DATA_FAILURE' }
    | { type: 'SET_STATUS'; payload: GameStatus }
    | { type: 'GAME_START_REQUEST'; payload: { mode: GameMode; isNewRun: boolean } } // isNewRun 추가
    | { type: 'GAME_START_SUCCESS'; payload: { correctNames: Set<string> } }
    | { type: 'SELECT_ANSWER'; payload: { selectedName: string; isCorrect: boolean } };

const initialQTable = SOUNDS_CONFIG.reduce((acc, s) => ({ ...acc, [s.name]: SOUNDS_CONFIG.reduce((q, i) => ({ ...q, [i.name]: 0 }), {}) }), {});
const initialUserStats = SOUNDS_CONFIG.reduce((acc, s) => ({ ...acc, [s.name]: { correct: 0, total: 0 } }), {});

const initialState: GameState = {
    status: 'LOADING',
    mode: 'STANDARD',
    difficulty: 1,
    qTable: initialQTable,
    userStats: initialUserStats,
    remainingChoices: MAX_CHOICES,
    correctSoundNames: new Set(),
    userSelections: {},
    score: 0,
    roundResult: null,
    // ====[ 미션 추가 2: 상태 초기값 설정 ]====
    hasLostChanceInRun: false,
    // =====================================
};

function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'LOAD_DATA_SUCCESS':
            return { ...state, ...action.payload, status: 'HOME' };
        case 'LOAD_DATA_FAILURE':
             return { ...state, status: 'HOME' };
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'GAME_START_REQUEST':
            return {
                ...state,
                status: 'PLAYING',
                mode: action.payload.mode,
                userSelections: {},
                score: 0,
                remainingChoices: MAX_CHOICES,
                roundResult: null,
                // ====[ 미션 추가 3: 게임 시작 시 미션 상태 초기화 ]====
                hasLostChanceInRun: action.payload.isNewRun ? false : state.hasLostChanceInRun,
                // ===============================================
            };
        case 'GAME_START_SUCCESS':
            return { ...state, correctSoundNames: action.payload.correctNames };
        case 'SELECT_ANSWER': {
            const { selectedName, isCorrect } = action.payload;
            const newSelections = { ...state.userSelections, [selectedName]: isCorrect ? 'correct' : 'incorrect' } as const;
            const newStats = { ...state.userStats };
            const newQTable = JSON.parse(JSON.stringify(state.qTable));
            const reward = isCorrect ? 1 : -1;

            state.correctSoundNames.forEach(name => {
                if(!state.userSelections[name]){
                    newStats[name] = { correct: newStats[name].correct + (isCorrect ? 1 : 0), total: newStats[name].total + 1 };
                    const futureQValues = Object.values(newQTable[selectedName] ?? {}) as number[];
                    const maxFutureQ = futureQValues.length > 0 ? Math.max(...futureQValues) : 0;
                    const oldQ = newQTable[name]?.[selectedName] ?? 0;
                    newQTable[name][selectedName] = oldQ + LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxFutureQ - oldQ);
                }
            });
            
            const newCorrectNames = new Set(state.correctSoundNames);
            if (isCorrect) newCorrectNames.delete(selectedName);

            const didWin = newCorrectNames.size === 0;
            const didLose = !isCorrect && state.remainingChoices - 1 <= 0;
            const isFinished = didWin || didLose;
            const newDifficulty = didWin ? state.difficulty + 1 : (didLose && state.difficulty > 1 ? state.difficulty - 1 : state.difficulty); // 오답 시 난이도 하락 로직 추가

            return {
                ...state,
                userSelections: newSelections,
                correctSoundNames: newCorrectNames,
                remainingChoices: isCorrect ? state.remainingChoices : state.remainingChoices - 1,
                score: isCorrect ? state.score + (10 * state.difficulty) : state.score,
                status: isFinished ? 'RESULTS' : 'PLAYING',
                difficulty: newDifficulty,
                userStats: newStats,
                qTable: newQTable,
                roundResult: isFinished ? (didWin ? 'WIN' : 'LOSE') : null,
                // ====[ 미션 추가 4: 실수 기록 ]====
                hasLostChanceInRun: state.hasLostChanceInRun || !isCorrect,
                // =================================
            };
        }
        default:
            return state;
    }
}

const useAuditoryGame = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    // ====[ 미션 추가 5: 컨텍스트 및 Ref 사용 ]====
    const starContext = useContext(StarContext);
    const clearContext = useContext(ClearContext);
    const prevDifficultyRef = useRef<number>(state.difficulty);
    useEffect(() => {
        prevDifficultyRef.current = state.difficulty;
    });
    const previousDifficulty = prevDifficultyRef.current;
    
    useEffect(() => {
        // 난이도가 2에서 3으로 상승하는 순간
        if (previousDifficulty === 2 && state.difficulty === 3) {
            starContext?.addStar('matchGameAI');
            if (!state.hasLostChanceInRun) {
                clearContext?.markAsCleared('matchGameAI');
            }
        }
    }, [state.difficulty, state.hasLostChanceInRun, previousDifficulty, starContext, clearContext]);
    // ===============================================

    useEffect(() => {
        const loadData = async () => {
            try {
                await audioManager.loadSoundsAsync();
                const savedData = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedData) {
                    const { difficulty, qTable, userStats } = JSON.parse(savedData);
                    dispatch({ type: 'LOAD_DATA_SUCCESS', payload: { difficulty, qTable, userStats } });
                } else {
                    dispatch({ type: 'LOAD_DATA_FAILURE' });
                }
            } catch (e) {
                console.error("데이터 로딩/초기화 실패", e);
                dispatch({ type: 'LOAD_DATA_FAILURE' });
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (state.status === 'RESULTS' || state.status === 'HOME') {
            const dataToSave = {
                difficulty: state.difficulty,
                qTable: state.qTable,
                userStats: state.userStats,
            };
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        }
    }, [state.status, state.difficulty, state.qTable, state.userStats]);
    
    // isNewRun 파라미터 추가
    const startGame = useCallback((mode: GameMode, isNewRun: boolean = false) => {
        dispatch({ type: 'GAME_START_REQUEST', payload: { mode, isNewRun } });

        let quizSounds: { name: string; file: any }[] = [];
        const soundCount = Math.min(state.difficulty + 2, SOUNDS_CONFIG.length);
        let useStandardMode = mode === 'STANDARD';

        if (mode === 'WEAKNESS') {
            const accuracies = Object.entries(state.userStats)
                .map(([name, { correct, total }]) => ({ name, acc: total < 3 ? 1 : correct / total }))
                .sort((a, b) => a.acc - b.acc);
            
            const weakSoundsSet = new Set(accuracies.slice(0, soundCount).map(s => s.name));
            
            if (weakSoundsSet.size >= 2) {
                quizSounds = SOUNDS_CONFIG.filter(s => weakSoundsSet.has(s.name));
            } else {
                useStandardMode = true;
            }
        }
        
        if (useStandardMode) {
            const shuffled = [...SOUNDS_CONFIG].sort(() => 0.5 - Math.random());
            quizSounds = shuffled.slice(0, soundCount);
        }
        
        quizSounds.forEach(s => audioManager.playSound(s.name));
        dispatch({ type: 'GAME_START_SUCCESS', payload: { correctNames: new Set(quizSounds.map(s => s.name)) } });

    }, [state.difficulty, state.userStats, state.qTable]);

    const handleSelectAnswer = useCallback((selectedName: string) => {
        if (state.status !== 'PLAYING') return;
        const isCorrect = state.correctSoundNames.has(selectedName);
        dispatch({ type: 'SELECT_ANSWER', payload: { selectedName, isCorrect } });
    }, [state.status, state.correctSoundNames]);

    const navigate = (status: GameStatus) => dispatch({ type: 'SET_STATUS', payload: status });

    return { state, startGame, handleSelectAnswer, navigate };
};

const HomeScreen = memo(({ onStartGame, onShowStats }: { onStartGame: (mode: GameMode, isNewRun: boolean) => void, onShowStats: () => void }) => (
    <View style={styles.centered}>
        <Text style={styles.title}>청능 훈련 (Q-Learning)</Text>
        <View style={styles.menuButton}><Button title="표준 모드" onPress={() => onStartGame('STANDARD', true)} /></View>
        <View style={styles.menuButton}><Button title="약점 훈련 모드" onPress={() => onStartGame('WEAKNESS', true)} /></View>
        <View style={styles.menuButton}><Button title="내 통계 보기" onPress={onShowStats} /></View>
    </View>
));

const GameScreen = memo(({ state, onSelect }: { state: GameState, onSelect: (name: string) => void }) => (
    <View style={styles.centered}>
        <Text style={styles.statusText}>난이도: {state.difficulty} | 남은 기회: {state.remainingChoices} | 점수: {state.score}</Text>
        <View style={styles.gameBoard}>
            {SOUNDS_CONFIG.map(({ name }) => {
                const status = state.userSelections[name];
                const color = status === 'correct' ? '#28a745' : status === 'incorrect' ? '#dc3545' : '#007bff';
                return (
                    <View key={name} style={styles.buttonWrapper}>
                        <Button title={name} onPress={() => onSelect(name)} color={color} disabled={!!status} />
                    </View>
                );
            })}
        </View>
    </View>
));

const ResultsScreen = memo(({ state, onContinue, onGoHome }: { state: GameState, onContinue: (mode: GameMode, isNewRun: boolean) => void, onGoHome: () => void }) => (
    <View style={styles.centered}>
        <Text style={styles.title}>{state.roundResult === 'WIN' ? '🎉 라운드 성공! 🎉' : '😥 라운드 실패 😥'}</Text>
        <Text style={styles.resultText}>최종 점수: {state.score}</Text>
        {state.roundResult === 'LOSE' && 
            <Text style={styles.resultText}>정답: {[...state.correctSoundNames].join(', ')}</Text>
        }
        <View style={styles.menuButton}><Button title="계속하기" onPress={() => onContinue(state.mode, false)} /></View>
        <View style={styles.menuButton}><Button title="홈으로" onPress={onGoHome} /></View>
    </View>
));

const StatsScreen = memo(({ stats, onGoHome }: { stats: UserStats, onGoHome: () => void }) => (
    <View style={styles.container}>
        <Text style={styles.title}>내 통계</Text>
        <ScrollView contentContainerStyle={styles.statsContainer}>
            {Object.entries(stats).sort(([,a],[,b])=>(a.total === 0 ? 1 : a.correct/a.total) - (b.total === 0 ? 1 : b.correct/b.total)).map(([name, { correct, total }]) => {
                const accuracy = total === 0 ? 'N/A' : `${Math.round((correct / total) * 100)}%`;
                return (
                    <Text key={name} style={styles.statItem}>{`${name}: ${accuracy} (${correct}/${total})`}</Text>
                );
            })}
        </ScrollView>
        <View style={styles.homeButton}><Button title="홈으로" onPress={onGoHome} /></View>
    </View>
));

export default function MatchGameAI() {
    const { state, startGame, handleSelectAnswer, navigate } = useAuditoryGame();

    const renderScreen = () => {
        switch (state.status) {
            case 'HOME': return <HomeScreen onStartGame={startGame} onShowStats={() => navigate('STATS')} />;
            case 'PLAYING': return <GameScreen state={state} onSelect={handleSelectAnswer} />;
            case 'RESULTS': return <ResultsScreen state={state} onContinue={startGame} onGoHome={() => navigate('HOME')} />;
            case 'STATS': return <StatsScreen stats={state.userStats} onGoHome={() => navigate('HOME')} />;
            case 'LOADING': default: return <ActivityIndicator size="large" color="#007bff" />;
        }
    };

    return (
        <View style={styles.container}>
            {/* ====[ UI 추가: 미션 아이콘 ]==== */}
            {state.status !== 'LOADING' && state.status !== 'HOME' && (
              <MissionProgressIcon
                gameId="matchGameAI"
                title="Q-러닝 미션"
                missionText="난이도 3 도달하기"
                clearText="기회 소모 없이 난이도 3 도달"
                progressItems={[
                  { label: '현재 난이도', value: state.difficulty },
                  { label: '이번 런 기회 소모', value: state.hasLostChanceInRun ? '있음' : '없음' }
                ]}
              />
            )}
            {/* ================================ */}
            {renderScreen()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 40, textAlign: 'center' },
    menuButton: { width: '80%', marginVertical: 10 },
    homeButton: { width: '80%', marginVertical: 10, alignSelf: 'center', paddingBottom: 20},
    statusText: { fontSize: 18, fontWeight: '500', color: '#555', marginBottom: 20, textAlign: 'center' },
    gameBoard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    buttonWrapper: { margin: 8, width: 100 },
    resultText: { fontSize: 20, marginVertical: 5, textAlign: 'center' },
    statsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    statItem: { fontSize: 18, paddingVertical: 8, width: '100%', textAlign: 'left', borderBottomWidth: 1, borderBottomColor: '#eee' },
});