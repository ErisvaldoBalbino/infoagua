import { api } from "./client";

export interface UpdateMePayload {
  name?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const usersService = {
  updateMe: (payload: UpdateMePayload) =>
    api.patch<UserResponse>("/users/me", payload).then((r) => r.data),
};
