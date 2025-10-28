import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

const STAR_STORAGE_KEY = '@MiniGameApp:starData';

interface StarData {
    [gameId: string]: 1;
}

interface StarContextType {
    starData: StarData;
    addStar: (gameId: string) => void;
}

export const StarContext = createContext<StarContextType | undefined>(undefined);

export const StarProvider = ({ children }: { children: ReactNode }) => {
    const [starData, setStarData] = useState<StarData>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadStars = async () => {
            try {
                const savedStars = await AsyncStorage.getItem(STAR_STORAGE_KEY);
                if (savedStars) {
                    setStarData(JSON.parse(savedStars));
                }
            } catch (e) {
                console.error('Failed to load star data.', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStars();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(STAR_STORAGE_KEY, JSON.stringify(starData))
                .catch(e => console.error('Failed to save star data.', e));
        }
    }, [starData, isLoading]);

    const addStar = (gameId: string) => {
        if (starData[gameId]) {
            return;
        }
        console.log(`'${gameId}' 게임의 별을 획득했습니다!`);
        setStarData(prevData => ({
            ...prevData,
            [gameId]: 1,
        }));
    };

    return (
        <StarContext.Provider value={{ starData, addStar }}>
            {children}
        </StarContext.Provider>
    );
};