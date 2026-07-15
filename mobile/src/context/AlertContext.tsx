import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { registerAlertCallback, AlertButton, AlertOptions } from "../utils/alert";
import { theme } from "../constants/theme";
import { CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react-native";

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
}

const AlertContext = createContext<(() => void) | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
  });

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = registerAlertCallback((title, message, buttons, options) => {
      setAlertState({
        visible: true,
        title,
        message,
        buttons,
        options,
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (alertState.visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();
    }
  }, [alertState.visible]);

  const handleClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 180,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => {
      setAlertState((prev) => ({ ...prev, visible: false }));
      if (callback) {
        callback();
      }
      if (alertState.options?.onDismiss) {
        alertState.options.onDismiss();
      }
    });
  };

  const handleBackdropPress = () => {
    if (alertState.options?.cancelable !== false) {
      const cancelBtn = alertState.buttons?.find((b) => b.style === "cancel");
      handleClose(cancelBtn?.onPress);
    }
  };

  const getAlertStyle = () => {
    const titleLower = alertState.title.toLowerCase();
    
    if (
      titleLower.includes("sucesso") ||
      titleLower.includes("success") ||
      titleLower.includes("salvo") ||
      titleLower.includes("concluído") ||
      titleLower.includes("atualizado")
    ) {
      return {
        icon: <CheckCircle size={28} color={theme.colors.status.success} />,
        bgColor: theme.colors.status.successBg,
      };
    }
    
    if (
      titleLower.includes("erro") ||
      titleLower.includes("error") ||
      titleLower.includes("falha") ||
      titleLower.includes("perigo") ||
      titleLower.includes("inválido")
    ) {
      return {
        icon: <AlertCircle size={28} color={theme.colors.status.danger} />,
        bgColor: theme.colors.status.dangerBg,
      };
    }

    if (
      titleLower.includes("aviso") ||
      titleLower.includes("atenção") ||
      titleLower.includes("warning") ||
      titleLower.includes("alerta") ||
      titleLower.includes("permissão") ||
      titleLower.includes("necessária")
    ) {
      return {
        icon: <AlertTriangle size={28} color={theme.colors.status.warning} />,
        bgColor: theme.colors.status.warningBg,
      };
    }

    return {
      icon: <Info size={28} color={theme.colors.primary} />,
      bgColor: theme.colors.lightBg,
    };
  };

  const styleConfig = getAlertStyle();

  // Standardize buttons
  const renderButtons = () => {
    const buttons = alertState.buttons || [];
    
    if (buttons.length === 0) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => handleClose()}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.buttonTextPrimary]}>OK</Text>
        </TouchableOpacity>
      );
    }

    const renderButton = (btn: AlertButton, index: number, isFlex = false) => {
      let btnStyle: StyleProp<ViewStyle> = styles.buttonPrimary;
      let textStyle: StyleProp<TextStyle> = styles.buttonTextPrimary;

      if (btn.style === "cancel") {
        btnStyle = styles.buttonCancel;
        textStyle = styles.buttonTextCancel;
      } else if (btn.style === "destructive") {
        btnStyle = styles.buttonDestructive;
        textStyle = styles.buttonTextDestructive;
      }

      return (
        <TouchableOpacity
          key={index}
          style={[styles.button, btnStyle, isFlex && { flex: 1 }]}
          onPress={() => handleClose(btn.onPress)}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, textStyle]}>{btn.text || "OK"}</Text>
        </TouchableOpacity>
      );
    };

    if (buttons.length === 2) {
      return (
        <View style={styles.buttonRow}>
          {renderButton(buttons[0], 0, true)}
          {renderButton(buttons[1], 1, true)}
        </View>
      );
    }

    return (
      <View style={styles.buttonColumn}>
        {buttons.map((btn, index) => renderButton(btn, index, false))}
      </View>
    );
  };

  return (
    <AlertContext.Provider value={() => handleClose()}>
      {children}
      <Modal
        visible={alertState.visible}
        transparent
        animationType="none"
        onRequestClose={() => {
          if (alertState.options?.cancelable !== false) {
            handleClose();
          }
        }}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.alertContainer,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {/* Header Icon */}
                <View style={[styles.iconContainer, { backgroundColor: styleConfig.bgColor }]}>
                  {styleConfig.icon}
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                  <Text style={styles.titleText}>{alertState.title}</Text>
                  {!!alertState.message && (
                    <Text style={styles.messageText}>{alertState.message}</Text>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.footerContainer}>{renderButtons()}</View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
}

const { width } = Dimensions.get("window");
const maxModalWidth = Math.min(width * 0.85, 340);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Slate 900 tint with transparency
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: maxModalWidth,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.card,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  contentContainer: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  titleText: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  messageText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  footerContainer: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  buttonColumn: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
  },
  button: {
    height: 48,
    borderRadius: theme.borderRadius.card,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonTextPrimary: {
    color: theme.colors.text.light,
  },
  buttonCancel: {
    backgroundColor: theme.colors.borderLight,
  },
  buttonTextCancel: {
    color: theme.colors.text.secondary,
  },
  buttonDestructive: {
    backgroundColor: theme.colors.status.danger,
  },
  buttonTextDestructive: {
    color: theme.colors.text.light,
  },
});
