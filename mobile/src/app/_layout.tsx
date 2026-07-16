import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import { AlertProvider } from "../context/AlertContext";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { theme } from "../constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {
});

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) {
      console.error("[RootLayout] Font loading failed:", error);
    }
    if (fontsLoaded || error) {
      SplashScreen.hideAsync().catch(() => {
      });
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <AlertProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.cardBackground,
            },
            headerTintColor: theme.colors.headerBlue,
            headerTitleStyle: {
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.xl,
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="detalhes/[id]" options={{ title: "Detalhes" }} />
          <Stack.Screen name="comentarios/[id]" options={{ title: "Comentários" }} />
          <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
          <Stack.Screen name="localizacao" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </AlertProvider>
  );
}

