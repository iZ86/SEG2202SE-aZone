import { upload } from "@vercel/blob/client";
import { type PutBlobResult } from "@vercel/blob";

export const uploadBlobAPI = async (token: string, file: File): Promise<PutBlobResult | undefined> => {
  try {
    return await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "http://localhost:8080/api/v1/storages",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

export const updateProfilePictureAPI = async (token: string, profilePictureUrl: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/users/profile-picture",
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePictureUrl: profilePictureUrl,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};
