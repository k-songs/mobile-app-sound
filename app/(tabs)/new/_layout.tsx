import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, Image, StyleSheet, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SideMenu from '@/components/SideMenu';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

// 게임 탭 데이터 제거 (하단 버튼으로 통합)



export default function Layout() {
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* index 화면 */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
            title: '',
          }}
        />

        {/* 게임 라우트들 */}
        <Stack.Screen
          name="(games)/matchGame"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="(games)/orderGame"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="(games)/music"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="(games)/matchGameAI"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="(games)/matchGamePG"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="(games)/matchGameRL"
          options={{
            headerShown: true,
            header: () => (
              <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
                <BlurView style={styles.header} intensity={70}>
                  <Pressable
                    style={styles.menuButton}
                    onPress={() => setIsSideMenuOpen(true)}
                  >
                    <Ionicons name="menu" size={24} color="black" />
                  </Pressable>

                  <Image
                    source={require("../../../assets/images/splash.png")}
                    style={styles.headerLogo}
                  />
                </BlurView>
              </View>
            ),
          }}
        />
      </Stack>

      {/* SideMenu는 전체 Stack 위에 배치 */}
      <SideMenu
        isVisible={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: 'red',
  },
  menuButton: {
    padding: 8,
    position: "absolute",
    left: 16,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  // 탭 관련 스타일 제거 (하단 버튼으로 통합)
});