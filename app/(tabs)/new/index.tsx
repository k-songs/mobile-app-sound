import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClearContext } from '../../../context/ClearContext';
import { StarContext } from '../../../context/StarContext';
import { useRouter } from 'expo-router';
import { GAME_DATA } from './utils/gameData';


const games = GAME_DATA.map(({ id, name, icon, route }) => ({
    id,
    name,
    icon,
    route: route.index
}));

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
            <View style={styles.navigationBar}>
                <  ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.navScrollView}
                >
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
                                    styles.navButton,
                                    isCleared && styles.clearedBorder
                                ]} 
                                onPress={() => router.push(game.route as any)}
                            >
                                {hasStar && (
                                    <View style={styles.starIcon}>
                                        <Ionicons name="star" size={16} color="#FFD700" />
                                    </View>
                                )}
                                <Ionicons name={game.icon as any} size={28} color="#333" />
                                <Text style={styles.navText}>{game.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    navigationBar: {
        height: 90,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EAECEE',
        justifyContent: 'center',
    },
    navScrollView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    navButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        minWidth: 80,
        height: 70,
        position: 'relative',
        borderRadius: 10,
    },
    navText: {
        fontSize: 12,
        color: '#34495E',
        marginTop: 5,
        fontWeight: '600',
    },
    clearedBorder: {
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    starIcon: {
        position: 'absolute',
        top: 5,
        right: 10,
        zIndex: 1,
    },
});