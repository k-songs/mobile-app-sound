import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClearContext } from '../../../context/ClearContext';
import { StarContext } from '../../../context/StarContext';
import { useRouter } from 'expo-router';
// 게임 목록 직접 정의 (절대 경로로 수정)
const games = [
    { id: 'matchGame', name: '소리 맞추기', icon: 'game-controller-outline', route: '/new/(games)/matchGame' },
    { id: 'orderGame', name: '소리 순서', icon: 'swap-horizontal-outline', route: '/new/(games)/orderGame' },
    { id: 'music', name: '피아노', icon: 'musical-notes-outline', route: '/activity' },
    { id: 'matchGameRL', name: '강화학습', icon: 'rocket-outline', route: '/new/(games)/matchGameAI' },
    { id: 'matchGamePG', name: 'PG', icon: 'analytics-outline', route: '/new/(games)/matchGamePG' },
] as const;

// music 게임의 난이도 개수
const MUSIC_DIFFICULTY_COUNT = 5;

export default function App() {
    const starContext = useContext(StarContext);
    const clearContext = useContext(ClearContext);
    const router = useRouter();
    if (!starContext || !clearContext) {
        return null;
    }

    const { starData } = starContext;
    const { clearData } = clearContext;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gameGrid}>
                {games.map((game) => {
                    let hasStar = !!starData[game.id];
                    let isCleared = !!clearData[game.id];
                    
                    if (game.id === 'music') {
                        const starCount = Object.keys(starData).filter(key => key.startsWith('music_')).length;
                        const clearCount = Object.keys(clearData).filter(key => key.startsWith('music_')).length;
                        
                        hasStar = starCount === MUSIC_DIFFICULTY_COUNT;
                        isCleared = clearCount === MUSIC_DIFFICULTY_COUNT;
                    }

                    return (
                        <TouchableOpacity 
                            key={game.id} 
                            style={[
                                styles.gameButton,
                                isCleared && styles.clearedBorder
                            ]} 
                            onPress={() => router.push(game.route as any)}
                        >
                            {hasStar && (
                                <View style={styles.starIcon}>
                                    <Ionicons name="star" size={20} color="#FFD700" />
                                </View>
                            )}
                            <Ionicons name={game.icon as any} size={40} color="#333" />
                            <Text style={styles.gameText}>{game.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    gameGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        maxWidth: 400,
    },
    gameButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 120,
        height: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gameText: {
        fontSize: 13,
        color: '#34495E',
        marginTop: 8,
        fontWeight: '600',
        textAlign: 'center',
    },
    clearedBorder: {
        borderWidth: 3,
        borderColor: '#FFD700',
    },
    starIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },
});