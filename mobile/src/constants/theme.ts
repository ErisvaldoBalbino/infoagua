import { Platform } from "react-native";

export const theme = {
  colors: {
    primary: "#1070D0",       // Azul marca principal
    secondary: "#208AEF",     // Azul mais claro para interações/links
    dark: "#004B93",          // Azul escuro para destaques
    headerBlue: "#0056C6",     // Azul usado nos cabeçalhos e loadings
    lightBg: "#EFF6FF",       // Azul suave para backgrounds de ícones/destaques
    background: "#F8FAFC",    // Fundo padrão das telas (cool white)
    cardBackground: "#FFFFFF",// Fundo padrão de cards e inputs
    border: "#E2E8F0",        // Cor de borda padrão
    borderLight: "#F1F5F9",   // Cor de borda mais suave
    
    text: {
      primary: "#1E293B",     // Texto principal (slate-800)
      secondary: "#64748B",   // Texto secundário (slate-600)
      tertiary: "#94A3B8",    // Texto desativado/legendas (slate-400)
      light: "#FFFFFF",       // Texto claro para fundos escuros
      darker: "#0F172A",      // Texto ultra escuro (slate-900)
      authLabel: "#4B5563",   // Rótulo dos campos de login/cadastro
    },

    status: {
      success: "#10B981",
      successBg: "#ECFDF5",
      warning: "#F97316",
      warningBg: "#FFF7ED",
      danger: "#EF4444",
      dangerBg: "#FEF2F2",
    }
  },

  typography: {
    fonts: {
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      semiBold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
    },
    sizes: {
      xs: 11,
      sm: 13,
      md: 14,
      base: 15,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 22,
      display: 26,
      hero: 28,
      giant: 64,
    }
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    card: 12,
    squircle: 12,
    button: 16,
    input: 14,
    sheet: 24,
    pill: 50,
  },

  shadows: {
    light: Platform.select({
      web: {
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.02)",
      },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      },
    }) as any,
    medium: Platform.select({
      web: {
        boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.04)",
      },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      },
    }) as any,
    elevated: Platform.select({
      web: {
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
      },
    }) as any,
  }
};
