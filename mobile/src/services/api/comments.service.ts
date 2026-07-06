import { api } from "./client";

export interface CommentUser {
  id: string;
  name: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

export interface CreateCommentPayload {
  content: string;
}

export const commentsService = {
  findByOccurrence: (occurrenceId: string) =>
    api
      .get<CommentResponse[]>(`/occurrences/${occurrenceId}/comments`)
      .then((r) => r.data),

  create: (occurrenceId: string, payload: CreateCommentPayload) =>
    api
      .post<CommentResponse>(`/occurrences/${occurrenceId}/comments`, payload)
      .then((r) => r.data),

  remove: (commentId: string) => api.delete(`/comments/${commentId}`),
};
