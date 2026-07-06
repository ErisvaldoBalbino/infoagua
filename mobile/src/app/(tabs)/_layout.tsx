import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { LayoutGrid, Map, PlusCircle, History, CloudRain } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <LayoutGrid size={22} color={focused ? "#FFFFFF" : "#4B5563"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <Map size={22} color={focused ? "#FFFFFF" : "#4B5563"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="relatar"
        options={{
          title: "Relatar",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <PlusCircle size={22} color={focused ? "#FFFFFF" : "#4B5563"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <History size={22} color={focused ? "#FFFFFF" : "#4B5563"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="clima"
        options={{
          title: "Clima",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
              <CloudRain size={22} color={focused ? "#FFFFFF" : "#4B5563"} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#F3F4F6",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconWrapper: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconWrapper: {
    backgroundColor: "#005CBB",
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
