import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#208AEF",
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#111827",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="detalhes/[id]" options={{ title: "Detalhes" }} />
      <Stack.Screen name="comentarios/[id]" options={{ title: "Comentários" }} />
      <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
      <Stack.Screen name="localizacao" options={{ title: "Localização" }} />
    </Stack>
  );
}
