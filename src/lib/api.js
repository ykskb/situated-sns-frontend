import { request, requestWithIdToken } from "./client";
import getConfig from "next/config";

export const login = async (authToken) => {
  return await request("POST", "/api/login", {}, {}, authToken);
};

export const getAuthUserInfo = async (authToken) => {
  const { publicRuntimeConfig } = getConfig();
  try {
    return await request(
      "GET",
      publicRuntimeConfig.BACKEND_URL + "/auth-user",
      null,
      {},
      authToken
    );
  } catch (e) {
    return null;
  }
};

export const postProfileImage = async (imageFile) => {
  const { publicRuntimeConfig } = getConfig();
  let formData = new FormData();
  formData.append("file", imageFile);
  return await requestWithIdToken(
    publicRuntimeConfig.BACKEND_URL + "/profile-image",
    "POST",
    formData,
    {}
  );
};

export const postPostImage = async (imageFile) => {
  const { publicRuntimeConfig } = getConfig();
  let formData = new FormData();
  formData.append("file", imageFile);
  return await requestWithIdToken(
    publicRuntimeConfig.BACKEND_URL + "/post-image",
    "POST",
    formData,
    {}
  );
};
