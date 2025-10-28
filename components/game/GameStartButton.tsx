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


