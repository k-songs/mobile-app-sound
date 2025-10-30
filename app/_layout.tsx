import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { StarProvider } from "../context/StarContext";
import { ClearProvider } from "../context/ClearContext";

SplashScreen.preventAutoHideAsync().catch(() => {

});

function AnimatedAppLoader({
  children,
  image,
}: {
  children: React.ReactNode;
  image: number;
}) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.loadAsync(image);
      setSplashReady(true);
    }
    prepare();
  }, [image]);

  if (!isSplashReady) {
    return null;
  }

  return<AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({
  children,
  image,
}: {
  children: React.ReactNode;
  image: number;
}) {
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
  const animation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady]);

  const onImageLoaded = async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.error(e);
    } finally {
      setAppReady(true);
    }
  };

  const rotateValue = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const splashConfig = Constants.expoConfig?.splash || {};
  const backgroundColor = splashConfig.backgroundColor || "#ffffff";
  const resizeMode = splashConfig.resizeMode || "contain";
  const imageWidth = splashConfig.imageWidth || 200;

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none" // 터치 이벤트 무시
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            source={image}
            style={{
              resizeMode: resizeMode as any,
              width: imageWidth,
              transform: [{ scale: animation }, { rotate: rotateValue }],
            }}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <StarProvider>
      <ClearProvider>
        <AnimatedAppLoader image={require("../assets/images/splash.png")}>
          <StatusBar style="auto" animated hidden={false} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AnimatedAppLoader>
      </ClearProvider>
    </StarProvider>
  );
}