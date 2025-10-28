import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { memo, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import MissionProgressIcon from '../../../../components/MissionProgressIcon';
import { ClearContext } from '../../../../context/ClearContext';
import { StarContext } from '../../../../context/StarContext';

// ===================================================================================
// 📁 src/config/constants.ts
// ===================================================================================
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
const STORAGE_KEY = '@AuditoryTrainingAppPG:gameState';

// ===================================================================================
// 📁 src/services/AudioManager.ts
// ===================================================================================
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
        console.log("사운드 로딩을 시작합니다...");
        await Promise.all(SOUNDS_CONFIG.map(async ({ name, file }) => {
            try {
                const { sound } = await Audio.Sound.createAsync(file);
                this.sounds.set(name, sound);
            } catch (error) {
                console.error(`'${name}' 사운드 로딩 실패:`, error);
            }
        }));
        console.log(`${this.sounds.size}개의 사운드를 성공적으로 로드했습니다.`);
    }

    async playSound(name: string) {
        try {
            const soundObject = this.sounds.get(name);
            if (soundObject) {
                await soundObject.stopAsync();
                await soundObject.replayAsync();
            } else {
                console.error(`'${name}' 사운드를 찾을 수 없습니다. 로드되지 않았을 수 있습니다.`);
            }
        } catch(e) {
            console.error(`'${name}' 사운드 재생 중 오류 발생:`, e);
        }
    }
}
const audioManager = AudioManager.getInstance();

// ===================================================================================
// 📁 src/state/gameReducer.ts
// ===================================================================================
type GameStatus = 'HOME' | 'LOADING' | 'PLAYING' | 'RESULTS' | 'STATS';
type GameMode = 'STANDARD' | 'WEAKNESS';
type Policy = { [state: string]: { [action: string]: number } };
type UserStats = { [sound: string]: { correct: number; total: number } };

type GameState = {
    status: GameStatus;
    mode: GameMode;
    difficulty: number;
    policy: Policy;
    userStats: UserStats;
    remainingChoices: number;
    correctSoundNames: Set<string>;
    userSelections: { [key: string]: 'correct' | 'incorrect' };
    score: number;
    roundResult: 'WIN' | 'LOSE' | null;
    hasLostChanceInRun: boolean; // 기회 소모 여부 추적
};

type Action =
    | { type: 'LOAD_DATA_SUCCESS'; payload: Partial<Pick<GameState, 'difficulty' | 'policy' | 'userStats'>> }
    | { type: 'LOAD_DATA_FAILURE' }
    | { type: 'SET_STATUS'; payload: GameStatus }
    | { type: 'START_GAME'; payload: { mode: GameMode; correctNames: Set<string>; isNewRun: boolean } }
    | { type: 'SELECT_ANSWER'; payload: { selectedName: string; isCorrect: boolean } };

const initialPolicy = SOUNDS_CONFIG.reduce((acc, s) => ({
    ...acc,
    [s.name]: SOUNDS_CONFIG.reduce((policy, i) => ({ ...policy, [i.name]: 1 / SOUNDS_CONFIG.length }), {})
}), {});

const initialUserStats = SOUNDS_CONFIG.reduce((acc, s) => ({ ...acc, [s.name]: { correct: 0, total: 0 } }), {});

const initialState: GameState = {
    status: 'LOADING',
    mode: 'STANDARD',
    difficulty: 1,
    policy: initialPolicy,
    userStats: initialUserStats,
    remainingChoices: MAX_CHOICES,
    correctSoundNames: new Set(),
    userSelections: {},
    score: 0,
    roundResult: null,
    hasLostChanceInRun: false, // 초기값 설정
};

function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'LOAD_DATA_SUCCESS':
            return { ...state, ...action.payload, status: 'HOME' };
        case 'LOAD_DATA_FAILURE':
             return { ...state, status: 'HOME' };
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'START_GAME':
            return {
                ...state,
                status: 'PLAYING',
                mode: action.payload.mode,
                correctSoundNames: action.payload.correctNames,
                userSelections: {},
                score: 0,
                remainingChoices: MAX_CHOICES,
                roundResult: null,
                // 새로운 게임 시작 시에만 기회 소모 여부 초기화
                hasLostChanceInRun: action.payload.isNewRun ? false : state.hasLostChanceInRun,
            };
        case 'SELECT_ANSWER': {
            const { selectedName, isCorrect } = action.payload;
            if (state.userSelections[selectedName]) return state;

            const newSelections = { ...state.userSelections, [selectedName]: isCorrect ? 'correct' : 'incorrect' as 'correct' | 'incorrect' };
            const newStats = { ...state.userStats };
            const statsForSelection = newStats[selectedName] || { correct: 0, total: 0 };
            newStats[selectedName] = { correct: statsForSelection.correct + (isCorrect ? 1 : 0), total: statsForSelection.total + 1 };
            const newPolicy = JSON.parse(JSON.stringify(state.policy));
            const reward = isCorrect ? 1 : -1;
            const policyForState = newPolicy[selectedName];
            const currentProb = policyForState[selectedName];
            const newUnnormalizedProb = currentProb * Math.exp(LEARNING_RATE * reward);
            policyForState[selectedName] = newUnnormalizedProb;
            const totalProb = Object.values(policyForState).reduce((sum: number, p: any) => sum + p, 0);

            if (totalProb > 0) {
                Object.keys(policyForState).forEach(actionKey => {
                    policyForState[actionKey] /= totalProb;
                });
            }

            const newCorrectNames = new Set(state.correctSoundNames);
            if (isCorrect) newCorrectNames.delete(selectedName);

            const didWin = newCorrectNames.size === 0;
            const didLose = !isCorrect && state.remainingChoices - 1 <= 0;
            const isFinished = didWin || didLose;
            const newDifficulty = didWin ? state.difficulty + 1 : (didLose && state.difficulty > 1 ? state.difficulty - 1 : state.difficulty);

            return {
                ...state,
                userSelections: newSelections,
                correctSoundNames: newCorrectNames,
                remainingChoices: isCorrect ? state.remainingChoices : state.remainingChoices - 1,
                score: isCorrect ? state.score + (10 * state.difficulty) : state.score,
                status: isFinished ? 'RESULTS' : 'PLAYING',
                difficulty: newDifficulty,
                userStats: newStats,
                policy: newPolicy,
                roundResult: isFinished ? (didWin ? 'WIN' : 'LOSE') : null,
                // 오답 시 기회 소모 기록
                hasLostChanceInRun: state.hasLostChanceInRun || !isCorrect,
            };
        }
        default:
            return state;
    }
}

// ===================================================================================
// 📁 src/hooks/useAuditoryGame.ts
// ===================================================================================
const useAuditoryGame = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    const starContext = useContext(StarContext);
    const clearContext = useContext(ClearContext);
    
    // 이전 난이도를 추적하기 위한 ref
    const prevDifficultyRef = useRef<number>(state.difficulty);
    useEffect(() => {
        prevDifficultyRef.current = state.difficulty;
    });
    const previousDifficulty = prevDifficultyRef.current;
    
    // 난이도 변경 감지하여 미션/클리어 조건 확인
    useEffect(() => {
        // 난이도가 2에서 3으로 상승하는 순간
        if (previousDifficulty === 2 && state.difficulty === 3) {
            starContext?.addStar('matchGamePG'); // 별 획득
            if (!state.hasLostChanceInRun) {
                clearContext?.markAsCleared('matchGamePG'); // 기회 소모 없었으면 클리어
            }
        }
    }, [state.difficulty, state.hasLostChanceInRun, previousDifficulty, starContext, clearContext]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await audioManager.loadSoundsAsync();
                const savedData = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    dispatch({ type: 'LOAD_DATA_SUCCESS', payload: { ...parsedData } });
                } else {
                    dispatch({ type: 'LOAD_DATA_FAILURE' });
                }
            } catch (e) {
                console.error("데이터 로딩 실패", e);
                dispatch({ type: 'LOAD_DATA_FAILURE' });
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (state.status !== 'LOADING') {
            const dataToSave = {
                difficulty: state.difficulty,
                policy: state.policy,
                userStats: state.userStats,
            };
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        }
    }, [state.difficulty, state.policy, state.userStats]);

    const startGame = useCallback((mode: GameMode, isNewRun: boolean = false) => {
        let quizSounds: { name: string; file: any }[] = [];
        const soundCount = Math.min(2 + state.difficulty, SOUNDS_CONFIG.length);
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
        
        const playSoundsSequentially = async () => {
            for (const sound of quizSounds) {
                await audioManager.playSound(sound.name);
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        };
        playSoundsSequentially();
        
        dispatch({ type: 'START_GAME', payload: { mode, correctNames: new Set(quizSounds.map(s => s.name)), isNewRun } });
    }, [state.difficulty, state.userStats]);

    const handleSelectAnswer = useCallback((selectedName: string) => {
        if (state.status !== 'PLAYING') return;
        const isCorrect = state.correctSoundNames.has(selectedName);
        dispatch({ type: 'SELECT_ANSWER', payload: { selectedName, isCorrect } });
    }, [state.status, state.correctSoundNames]);

    const navigate = (status: GameStatus) => dispatch({ type: 'SET_STATUS', payload: status });

    return { state, startGame, handleSelectAnswer, navigate };
};

// ===================================================================================
// 📁 src/screens/ (UI 화면 컴포넌트들)
// ===================================================================================
const HomeScreen = memo(({ onStartGame, onShowStats }: { onStartGame: (mode: GameMode, isNewRun: boolean) => void, onShowStats: () => void }) => (
    <View style={styles.centered}>
        <Text style={styles.title}>청능 훈련 (PG)</Text>
        {/* 새로운 도전을 시작할 때 isNewRun을 true로 전달 */}
        <View style={styles.menuButton}><Button title="표준 모드" onPress={() => onStartGame('STANDARD', true)} /></View>
        <View style={styles.menuButton}><Button title="약점 훈련 모드" onPress={() => onStartGame('WEAKNESS', true)} /></View>
        <View style={styles.menuButton}><Button title="내 통계 보기" onPress={onShowStats} /></View>
    </View>
));

const GameScreen = memo(({ state, onSelect }: { state: GameState, onSelect: (name: string) => void }) => (
    <View style={styles.centered}>
        <Text style={styles.statusText}>난이도: {state.difficulty} | 남은 기회: {state.remainingChoices} | 점수: {state.score}</Text>
        <Text style={styles.statusText}>들었던 소리를 모두 선택하세요</Text>
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
            <Text style={styles.resultText}>남은 정답: {[...state.correctSoundNames].join(', ') || '없음'}</Text>
        }
        {/* 계속하기는 isNewRun을 false로 전달하여 기회 소모 기록을 유지 */}
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

// ===================================================================================
// 📁 App.tsx
// ===================================================================================
export default function MatchGamePG() {
    const { state, startGame, handleSelectAnswer, navigate } = useAuditoryGame();

    const renderScreen = () => {
        switch (state.status) {
            case 'HOME': return <HomeScreen onStartGame={startGame} onShowStats={() => navigate('STATS')} />;
            case 'PLAYING': return <GameScreen state={state} onSelect={handleSelectAnswer} />;
            case 'RESULTS': return <ResultsScreen state={state} onContinue={startGame} onGoHome={() => navigate('HOME')} />;
            case 'STATS': return <StatsScreen stats={state.userStats} onGoHome={() => navigate('HOME')} />;
            case 'LOADING': default: return <View style={styles.centered}><ActivityIndicator size="large" color="#007bff" /></View>;
        }
    };

        return (
      <View style={styles.container}>
        {state.status !== 'LOADING' && state.status !== 'HOME' && (
          <MissionProgressIcon
            gameId="matchGamePG"
            title="PG 훈련 미션"
            missionText="난이도 3 도달하기"
            clearText="기회 소모 없이 난이도 3 도달"
            progressItems={[
              { label: '현재 난이도', value: state.difficulty },
              { label: '이번 런 기회 소모', value: state.hasLostChanceInRun ? '있음' : '없음' }
            ]}
          />
        )}
        {renderScreen()}
      </View>
    );
}

// ===================================================================================
// 📁 src/styles.ts
// ===================================================================================
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