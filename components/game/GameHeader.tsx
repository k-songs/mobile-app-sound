import React from 'react';
import { View, Text } from 'react-native';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { MAX_SETS } from '@/types/game';
import { AvatarLevel } from '@/types/avatar';
import { Layout, Cards, Typography, GameStyles, Colors } from '@/constants/GlobalStyles';

interface GameHeaderProps {
    title: string;
    subtitle: string;
    currentLevelInfo: AvatarLevel;
    levelProgress: number;
    gameStarted: boolean;
    currentQuestion: number;
    totalQuestions: number;
    currentSet: number;
    score?: number;
    perfectCount?: number;
    combo?: number;
    maxCombo?: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
    title,
    subtitle,
    currentLevelInfo,
    levelProgress,
    gameStarted,
    currentQuestion,
    totalQuestions,
    currentSet,
    score,
    perfectCount,
    combo,
    maxCombo,
}) => {
    if (gameStarted) {
        return (
            <View style={GameStyles.gameContainer}>
                {/* 문항 진행률 */}
                <View style={GameStyles.progressContainer}>
                    <Text style={GameStyles.progressText}>
                        {title} - 문항 {currentQuestion}/{totalQuestions} (세트 {currentSet}/{MAX_SETS})
                    </Text>
                    <View style={GameStyles.progressBar}>
                        <View
                            style={[
                                GameStyles.progressFill,
                                { width: `${(currentQuestion / totalQuestions) * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* 상단 점수판 */}
                <View style={GameStyles.scoreBoard}>
                    {score !== undefined && (
                        <View style={GameStyles.scoreItem}>
                            <Text style={GameStyles.scoreLabel}>점수</Text>
                            <Text style={GameStyles.scoreValue}>{score}</Text>
                        </View>
                    )}
                    {combo !== undefined && (
                        <View style={GameStyles.scoreItem}>
                            <Text style={GameStyles.scoreLabel}>콤보</Text>
                            <Text style={[GameStyles.scoreValue, GameStyles.comboValue]}>{combo}</Text>
                        </View>
                    )}
                    {perfectCount !== undefined && (
                        <View style={GameStyles.scoreItem}>
                            <Text style={GameStyles.scoreLabel}>Perfect</Text>
                            <Text style={[GameStyles.scoreValue, GameStyles.perfectValue]}>{perfectCount}</Text>
                        </View>
                    )}
                    {maxCombo !== undefined && (
                        <View style={GameStyles.scoreItem}>
                            <Text style={GameStyles.scoreLabel}>최대콤보</Text>
                            <Text style={[GameStyles.scoreValue, GameStyles.maxComboValue]}>{maxCombo}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={Layout.contentContainer}>
            <Text style={Typography.title}>{title}</Text>
            <Text style={Typography.subtitle}>{subtitle}</Text>

            {/* 아바타 표시 */}
            <View style={Cards.large}>
                <AvatarDisplay
                    avatarInfo={currentLevelInfo}
                    progress={levelProgress}
                    size="medium"
                    showProgress={true}
                />
            </View>
        </View>
    );
};

