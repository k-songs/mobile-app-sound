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
import { Pressable, View, StyleSheet } from "react-native";
import { useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import SideMenu from "@/components/SideMenu";


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
      <View style={[styles.header, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
        <Pressable
          style={styles.menuButton}
          onPress={() => setIsSideMenuOpen(true)}
        >
          <Ionicons name="menu" size={24} color="black" />
        </Pressable>
      </View>

      <SideMenu
        isVisible={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />

      <MaterialTopTabs
        screenOptions={{
          lazy: true,
          tabBarStyle: {
            backgroundColor: "rgba(255,255,255,0.2)",
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
    height: 60,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 12,
    position: "absolute",
    left: 16,
    top: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
});

