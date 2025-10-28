import {
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import type {
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { Pressable, View, Image, StyleSheet } from "react-native";
import { useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import SideMenu from "@/components/SideMenu";
import { BlurView } from "expo-blur";
import * as React from "react";
const { Navigator } = createMaterialTopTabNavigator();





export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {React.createElement(
        BlurView as any,
        { style: styles.header, intensity: 70 },
        <>
          <Pressable
            style={styles.menuButton}
            onPress={() => setIsSideMenuOpen(true)}
          >
            <Ionicons name="menu" size={24} color="black" />
          </Pressable>

          <SideMenu
            isVisible={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
          />

          <Image
            source={require("../../../assets/images/splash.png")}
            style={styles.headerLogo}
          />
        </>
      )}


      <MaterialTopTabs
        screenOptions={{
          lazy: true,
          tabBarStyle: {
            backgroundColor: "white",
            boxShadow: "none",
            position: "relative",
          },
          tabBarPressColor: "transparent",
          tabBarActiveTintColor: "#555",
          tabBarIndicatorStyle: {
            backgroundColor: "black",
            height: 1,
          },
          tabBarIndicatorContainerStyle: {
            backgroundColor: "#aaa",
            position: "absolute",
            top: 49,
            height: 1,
          },
        }}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: "1단계" }} />
        <MaterialTopTabs.Screen name="second" options={{ title: "2단계" }} />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
});

