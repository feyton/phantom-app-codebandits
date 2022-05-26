import axios from "axios";
import * as SecureStore from "expo-secure-store";
import getValueFor from "./getItem";
import saveItem from "./SaveItem";

export const base = "http://phantom.co.rw";

const axiosBase = axios.create({
  baseURL: base + "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "accept-language": "en",
    "Access-Control-Allow-Origin": true,
  },
});

const refreshToken = async () => {
  try {
    const response = await axiosBase.get("/accounts/refresh");
    if (response?.data?.data?.access_token) {
      await saveItem("token", response.data.data.access_token);
      return response.data.data.access_token;
    }
  } catch (error) {
    if (error?.response?.status === 400) {
      await SecureStore.deleteItemAsync("token");
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
};

axiosBase.interceptors.request.use(
  async (config) => {
    const token = await getValueFor("token");
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
axiosBase.interceptors.response.use(null, async (error) => {
  const originalRequest = error.config;
  if (error.config && error.response && error.response.status === 401) {
    if (originalRequest._retry === undefined) {
      originalRequest._retry = true;
      const accessToken = await refreshToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosBase.request(originalRequest);
    }
  }
  if (error?.response?.status === 403) {
    return Promise.reject(error);
  }
  return Promise.reject(error);
});

export default axiosBase;
