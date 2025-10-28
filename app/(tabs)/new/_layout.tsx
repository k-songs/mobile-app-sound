import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, Image, StyleSheet, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SideMenu from '@/components/SideMenu';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

// 게임 탭 데이터
const gameTabs = [
  { id: 'index', name: '게임 선택', route: '/new' },
  { id: 'matchGame', name: '소리 맞추기', route: '/new/(games)/matchGame' },
  { id: 'orderGame', name: '소리 순서', route: '/new/(games)/orderGame' },
  { id: 'music', name: '피아노', route: '/new/(games)/music' },
  { id: 'matchGameAI', name: 'AI 게임', route: '/new/(games)/matchGameAI' },
  { id: 'matchGamePG', name: 'PG 게임', route: '/new/(games)/matchGamePG' },
  { id: 'matchGameRL', name: '강화학습', route: '/new/(games)/matchGameRL' },
];

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
                
                {/* 커스텀 탭 네비게이션 */}
                <View style={styles.tabContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabScrollView}
                  >
                    {gameTabs.map((tab) => (
                      <Pressable
                        key={tab.id}
                        style={styles.tabButton}
                        onPress={() => {
                          console.log('Navigating to:', tab.route);
                          router.push(tab.route as any);
                        }}
                      >
                        <Text style={styles.tabText}>{tab.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
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
  tabContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabScrollView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});