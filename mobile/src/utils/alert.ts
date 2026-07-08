import { Alert as RNAlert, Platform } from "react-native";

export interface AlertButton {
  text?: string;
  onPress?: (value?: string) => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void => {
    if (Platform.OS === "web") {
      const msg = message ? `${title}\n\n${message}` : title;
      if (!buttons || buttons.length === 0) {
        window.alert(msg);
        return;
      }

      if (buttons.length === 1) {
        window.alert(msg);
        if (buttons[0].onPress) {
          buttons[0].onPress();
        }
        return;
      }

      const cancelBtn = buttons.find((b) => b.style === "cancel");
      const actionBtn = buttons.find((b) => b.style !== "cancel") || buttons[buttons.length - 1];

      const confirmed = window.confirm(msg);
      if (confirmed) {
        if (actionBtn && actionBtn.onPress) {
          actionBtn.onPress();
        }
      } else {
        if (cancelBtn && cancelBtn.onPress) {
          cancelBtn.onPress();
        }
      }
    } else {
      RNAlert.alert(title, message, buttons, options);
    }
  },
};
