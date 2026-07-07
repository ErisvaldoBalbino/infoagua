import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { commentsService, CommentResponse } from "../../services/api/comments.service";
import { Send, Trash2, MessageSquare, LogIn } from "lucide-react-native";

export default function CommentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated, user } = useAuth();

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setHasError(false);
        if (typeof id === "string") {
          const data = await commentsService.findByOccurrence(id);
          const sorted = data.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setComments(sorted);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
    fetchComments();
  }, [id, refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSendComment = async () => {
    if (!newCommentText.trim()) return;
    if (typeof id !== "string") return;

    setIsSubmitting(true);
    try {
      const addedComment = await commentsService.create(id, {
        content: newCommentText.trim(),
      });
      
      setComments((prev) => [...prev, addedComment]);
      setNewCommentText("");
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error creating comment:", error);
      Alert.alert("Erro", "Não foi possível enviar o comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      "Remover Comentário",
      "Deseja realmente apagar o seu comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await commentsService.remove(commentId);
              setComments((prev) => prev.filter((c) => c.id !== commentId));
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert("Erro", "Não foi possível apagar o comentário.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: CommentResponse }) => {
    const isOwner = user?.id === item.user.id;
    const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.authorContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user.name ? item.user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{item.user.name}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          {isOwner && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id)}
              style={styles.deleteButton}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#208AEF" />
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Falha ao carregar comentários</Text>
            <Text style={styles.errorText}>
              Não foi possível carregar os comentários.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true);
                setRefreshTrigger((prev) => prev + 1);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#208AEF"]}
                tintColor="#208AEF"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageSquare size={48} color="#9CA3AF" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>Sem comentários</Text>
                <Text style={styles.emptyText}>
                  Seja o primeiro a comentar sobre esta ocorrência!
                </Text>
              </View>
            }
          />
        )}

        {/* Bottom Input Section */}
        <View style={styles.bottomSection}>
          {isAuthenticated ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escreva um comentário..."
                placeholderTextColor="#9CA3AF"
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newCommentText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSendComment}
                disabled={!newCommentText.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.restrictedContainer}>
              <Text style={styles.restrictedText}>
                Faça login para comentar nesta ocorrência.
              </Text>
              <TouchableOpacity
                style={styles.restrictedLoginButton}
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.8}
              >
                <LogIn size={16} color="#FFFFFF" />
                <Text style={styles.restrictedLoginButtonText}>Fazer Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  commentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B5563",
  },
  authorName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  dateText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  deleteButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    paddingLeft: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  bottomSection: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    maxHeight: 80,
    paddingTop: Platform.OS === "ios" ? 4 : 0,
    paddingBottom: Platform.OS === "ios" ? 4 : 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  restrictedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  restrictedText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
  },
  restrictedLoginButton: {
    flexDirection: "row",
    backgroundColor: "#208AEF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    alignItems: "center",
  },
  restrictedLoginButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#208AEF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
