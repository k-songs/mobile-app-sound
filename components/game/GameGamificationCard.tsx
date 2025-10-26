import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Cards, Typography } from '@/constants/GlobalStyles';

interface GameGamificationCardProps {
    title: string;
    content: string | string[];
    style?: any;
}

export const GameGamificationCard: React.FC<GameGamificationCardProps> = ({
    title,
    content,
    style,
}) => {
    const renderContent = () => {
        if (typeof content === 'string') {
            return <Text style={Typography.cardContent}>{content}</Text>;
        }

        return content.map((line, index) => (
            <Text key={index} style={Typography.cardContent}>
                {line}
            </Text>
        ));
    };

    return (
        <View style={[Cards.info, style]}>
            <Text style={Typography.cardTitle}>{title}</Text>
            {renderContent()}
        </View>
    );
};

// 이 컴포넌트는 GlobalStyles를 완전히 사용하므로 별도 스타일 불필요
