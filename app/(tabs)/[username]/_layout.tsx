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
import {
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.containerDark : styles.containerLight,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <MaterialTopTabs
        screenOptions={{
          lazy: true,
          tabBarStyle: {
            backgroundColor: colorScheme === "dark" ? "#101010" : "white",
            shadowColor: "transparent",
            position: "relative",
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
          tabBarPressColor: "transparent",
          tabBarActiveTintColor: colorScheme === "dark" ? "white" : "#555",
          tabBarIndicatorStyle: {
            backgroundColor: colorScheme === "dark" ? "white" : "black",
            height: 1,
          },
          tabBarIndicatorContainerStyle: {
            backgroundColor: colorScheme === "dark" ? "#aaa" : "#555",
            position: "absolute",
            top: 48,
            height: 1,
          },
        }}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: "Training " }} />
        <MaterialTopTabs.Screen name="trainng1" options={{ title: "Training 1" }} />
        <MaterialTopTabs.Screen name="trainng2" options={{ title: "Training 2" }} />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
});