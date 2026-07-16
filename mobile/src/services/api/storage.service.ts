import { Platform } from "react-native";
import { api } from "./client";

export interface UploadResponse {
  url: string;
}

export const storageService = {
  uploadFile: async (uri: string): Promise<string> => {
    const formData = new FormData();
    
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1];
    
    let fileType = "image/jpeg";
    if (fileName.toLowerCase().endsWith(".png")) {
      fileType = "image/png";
    } else if (fileName.toLowerCase().endsWith(".gif")) {
      fileType = "image/gif";
    } else if (fileName.toLowerCase().endsWith(".webp")) {
      fileType = "image/webp";
    }

    if (Platform.OS === "web") {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append("file", blob, fileName);
    } else {
      formData.append("file", {
        uri,
        name: fileName,
        type: fileType,
      } as any);
    }

    const response = await api.post<UploadResponse>("/storage/upload", formData);
    
    return response.data.url;
  },

  deleteFile: async (url: string): Promise<void> => {
    await api.delete("/storage/delete", { data: { url } });
  },
};
