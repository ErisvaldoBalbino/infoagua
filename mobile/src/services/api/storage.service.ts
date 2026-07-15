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

    formData.append("file", {
      uri,
      name: fileName,
      type: fileType,
    } as any);

    const response = await api.post<UploadResponse>("/storage/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data.url;
  },
};
