import { Droplet, CheckCircle, AlertTriangle, Wrench } from "lucide-react-native";
import { OccurrenceType } from "../services/api/occurrences.service";

export const typeLabels: Record<OccurrenceType, string> = {
  shortage: "Falta d'água",
  return: "Retorno",
  quality: "Qualidade",
  leak: "Vazamento",
};

export const typeColors: Record<OccurrenceType, string> = {
  shortage: "#EF4444",
  return: "#10B981",
  quality: "#F59E0B",
  leak: "#F97316",
};

export const typeBadgeBgs: Record<OccurrenceType, string> = {
  shortage: "#FEE2E2",
  return: "#D1FAE5",
  quality: "#FEF3C7",
  leak: "#FFEDD5",
};

export const typeIcons: Record<OccurrenceType, any> = {
  shortage: Droplet,
  return: CheckCircle,
  quality: AlertTriangle,
  leak: Wrench,
};

export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours} h`;
  if (diffDays === 1) return "Há 1 dia";
  return `Há ${diffDays} dias`;
}
