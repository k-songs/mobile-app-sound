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
import LottieView from 'lottie-react-native';
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
            backgroundColor: colorScheme === "dark" ? "#101010" : "white",
            borderTopWidth: 0,
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

        <Tabs.Screen
          name="drum"
          options={{
            tabBarLabel: () => null,
            // size를 인자로 받아야 합니다.
            tabBarIcon: ({ focused, size }) => {
              // 1. 활성화된 아이콘의 최종 색상을 결정합니다.
              const iconColor = focused
                ? colorScheme === "dark"
                  ? "white"
                  : "black"
                : "gray";

              // 2. ★ 애니메이션 값 설정 (useRef 사용)
              // 초기 투명도(opacity) 값을 0으로 설정합니다.
              const glowOpacity = useRef(new Animated.Value(0)).current;

              // 3. ★ focused 상태 변화에 반응하는 로직
              useEffect(() => {
                if (focused) {
                  // 탭이 활성화되면 (focused = true)
                  // 1. 투명도를 1 (최대 광채)로 빠르게 설정
                  glowOpacity.setValue(1);

                  // 2. 0.3초 딜레이 후, 0.7초 동안 투명도를 0으로 서서히 줄입니다 (Fade Out)
                  Animated.timing(glowOpacity, {
                    toValue: 0,
                    duration: 2100, // 0.7초 동안 사라짐
                    delay: 900, // 0.3초 후에 사라지기 시작
                    useNativeDriver: true, // 성능 최적화를 위해 네이티브 드라이버 사용
                  }).start();
                } else {
                  // 탭이 비활성화되면 즉시 투명도를 0으로 리셋 (깜빡임 방지)
                  glowOpacity.setValue(0);
                }
              }, [focused]); // focused 상태가 바뀔 때마다 실행

              return (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>


                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: size * 1.6,
                      height: size * 1.6,
                      borderRadius: size * 0.8,
                      backgroundColor: iconColor,

                      // ★ 애니메이션이 적용될 opacity (glowOpacity 값에 따라 0.0 ~ 1.0)
                      opacity: glowOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.15], // 0일 땐 0%, 1일 땐 15% 투명도 (광채의 최대 강도)
                      }),
                    }}
                  />

                  {/* 2. 실제 아이콘 */}
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
            tabBarIcon: ({ focused, size = 24 }) => {
              const lottieRef = useRef<LottieView>(null);
              
              useEffect(() => {
                if (focused && lottieRef.current) {
                  // 탭이 활성화되면 애니메이션 재생
                  lottieRef.current.play();
                }
              }, [focused]);

              return (
                <View style={{ 
                  width: size, 
                  height: size, 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <LottieView
                    ref={lottieRef}
                    source={require('../../assets/lottie/piano-keys.json')}
                    style={{
                      width: size * 1.2,
                      height: size * 1.2,
                    }}
                    loop={false}
                    autoPlay={false}
                    colorFilters={[
                      {
                        keypath: "흰 건반 그룹",
                        color: focused 
                          ? (colorScheme === "dark" ? "#ffffff" : "#000000")
                          : "#cccccc"
                      },
                      {
                        keypath: "검은 건반 그룹", 
                        color: focused
                          ? (colorScheme === "dark" ? "#ff6b35" : "#2563eb")
                          : "#666666"
                      }
                    ]}
                  />
                </View>
              );
            },
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


        <Tabs.Screen
          name="new"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="key"
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