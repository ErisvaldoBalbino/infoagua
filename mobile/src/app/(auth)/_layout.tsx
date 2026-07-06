import { Stack } from "expo-router";

export default function AuthLayout() {
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
      <Stack.Screen name="login" options={{ title: "Entrar" }} />
      <Stack.Screen name="cadastro" options={{ title: "Criar Conta" }} />
    </Stack>
  );
}
