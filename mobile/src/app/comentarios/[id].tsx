import { StyleSheet, Text, View } from "react-native";

export default function CommentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentários</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
});
