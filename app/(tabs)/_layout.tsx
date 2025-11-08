import { Ionicons } from "@expo/vector-icons";
import { type BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useRef, useEffect } from "react";
import {
  Animated,
  useColorScheme,
  Pressable,
  View,
} from "react-native";
const AnimatedTabBarButton = ({
  children,
  onPress,
  style,
  ...restProps
}: BottomTabBarButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressOut = () => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 200,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 200,
      }),
    ]).start();
  };

  const { ref, ...filteredRestProps } = restProps as any;

  return (
    <Pressable
      {...filteredRestProps}
      onPress={onPress}
      onPressOut={handlePressOut}
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
      android_ripple={{ borderless: false, radius: 0 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();



  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor:"transparent",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            elevation: 0,
            
          },
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="home"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />

        {/* 임시 주석: drum 탭 - 전역 색상 테스트를 위해 주석 처리 */}
        
        <Tabs.Screen
          name="drum"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused, size }) => {
              const iconColor = focused
                ? colorScheme === "dark"
                  ? "white"
                  : "black"
                : "gray";

              const glowOpacity = useRef(new Animated.Value(0)).current;

              useEffect(() => {
                if (focused) {
                  glowOpacity.setValue(1);
                  Animated.timing(glowOpacity, {
                    toValue: 0,
                    duration: 2100,
                    delay: 900,
                    useNativeDriver: true,
                  }).start();
                } else {
                  glowOpacity.setValue(0);
                }
              }, [focused]);

              return (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: size * 1.6,
                      height: size * 1.6,
                      borderRadius: size * 0.8,
                      backgroundColor: iconColor,
                      opacity: glowOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.15],
                      }),
                    }}
                  />
                  <Ionicons
                    name="musical-notes"
                    size={size}
                    color={iconColor}
                  />
                </View>
              );
            },
          }}
        />
        

        <Tabs.Screen
          name="learn"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="book"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="add"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="heart-outline"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="[username]"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="person-outline"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />


   


      </Tabs>
    </>
  );
}