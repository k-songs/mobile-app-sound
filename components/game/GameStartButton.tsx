import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Buttons, Typography } from '@/constants/GlobalStyles';

interface GameStartButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: any;
}

export const GameStartButton: React.FC<GameStartButtonProps> = ({
    title,
    onPress,
    disabled = false,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[
                Buttons.primaryLarge,
                disabled && Buttons.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[
                Typography.buttonLarge,
                disabled && { color: "#999" }
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

// 이 컴포넌트는 GlobalStyles를 완전히 사용하므로 별도 스타일 불필요
