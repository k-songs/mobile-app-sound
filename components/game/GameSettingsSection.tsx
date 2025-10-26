import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Cards, Buttons, Typography } from '@/constants/GlobalStyles';

interface ModeOption {
    key: string;
    title: string;
    description: string;
    disabled?: boolean;
}

interface GameSettingsSectionProps {
    title: string;
    modes: ModeOption[];
    selectedMode: string;
    onModeSelect: (mode: string) => void;
    children?: React.ReactNode;
}

export const GameSettingsSection: React.FC<GameSettingsSectionProps> = ({
    title,
    modes,
    selectedMode,
    onModeSelect,
    children,
}) => {
    return (
        <View style={Layout.contentContainer}>
            {/* 훈련 모드 선택 */}
            <View style={Cards.default}>
                <Text style={Typography.cardTitle}>{title}</Text>

                {modes.map((mode) => (
                    <TouchableOpacity
                        key={mode.key}
                        style={[
                            Buttons.mode,
                            selectedMode === mode.key && Buttons.modeActive,
                            mode.disabled && Buttons.modeDisabled,
                        ]}
                        onPress={() => onModeSelect(mode.key)}
                        disabled={mode.disabled}
                    >
                        <Text style={[
                            Typography.button,
                            mode.disabled && styles.disabledText
                        ]}>
                            {mode.title}
                        </Text>
                        <Text style={[
                            Typography.cardContent,
                            mode.disabled && styles.disabledText
                        ]}>
                            {mode.description}
                        </Text>
                    </TouchableOpacity>
                ))}

                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // disabled 상태만 별도 관리 (GlobalStyles에 없음)
    disabledText: {
        color: '#999',
    },
});
