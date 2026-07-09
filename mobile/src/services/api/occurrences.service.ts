import { api } from "./client";

export type OccurrenceType =
  | "shortage" // Falta d'água
  | "return"   // Retorno do abastecimento
  | "quality"  // Problema de qualidade
  | "leak";    // Vazamento

export interface OccurrenceUser {
  id: string;
  name: string;
}

export interface OccurrenceResponse {
  id: string;
  type: OccurrenceType;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string;
  photoUrl: string | null;
  likesCount: number;
  commentsCount: number;
  user: OccurrenceUser;
  createdAt: string;
  updatedAt: string;
}

export interface OccurrenceMapPin {
  id: string;
  type: OccurrenceType;
  latitude: number;
  longitude: number;
}

export interface CreateOccurrencePayload {
  type: OccurrenceType;
  latitude: number;
  longitude: number;
  city: string;
  description?: string;
  photoUrl?: string;
}

export type UpdateOccurrencePayload = Partial<CreateOccurrencePayload>;

export interface FilterOccurrencesParams {
  type?: OccurrenceType;
  city?: string;
  cursor?: string;
  limit?: number;
}

export interface FilterMapParams {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  limit?: number;
}

export interface LikeToggleResult {
  liked: boolean;
}

export const occurrencesService = {
  findAll: (params?: FilterOccurrencesParams) =>
    api
      .get<OccurrenceResponse[]>("/occurrences", { params })
      .then((r) => r.data),

  findForMap: (params?: FilterMapParams) =>
    api
      .get<OccurrenceMapPin[]>("/occurrences/map", { params })
      .then((r) => r.data),

  findById: (id: string) =>
    api.get<OccurrenceResponse>(`/occurrences/${id}`).then((r) => r.data),

  create: (payload: CreateOccurrencePayload) =>
    api.post<OccurrenceResponse>("/occurrences", payload).then((r) => r.data),

  update: (id: string, payload: UpdateOccurrencePayload) =>
    api
      .patch<OccurrenceResponse>(`/occurrences/${id}`, payload)
      .then((r) => r.data),

  remove: (id: string) => api.delete(`/occurrences/${id}`),

  toggleLike: (id: string) =>
    api
      .post<LikeToggleResult>(`/occurrences/${id}/like`)
      .then((r) => r.data),

  getUserStats: () =>
    api
      .get<{ reports: number; confirmations: number }>("/users/me/stats")
      .then((r) => r.data),
};
