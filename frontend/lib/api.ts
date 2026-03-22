import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers['X-Request-ID'] = Math.random().toString(36).substring(2, 11);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
    } else if (error.response?.status >= 500) {
      const serverErrorMsg = "Server error, please try again.";
      if (error.response && error.response.data) {
        error.response.data.message = serverErrorMsg;
      }
      error.message = serverErrorMsg;
    }
    return Promise.reject(error);
  }
);

export const createAssignment = (formData: FormData) =>
  api.post("/api/assignments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });

export const fetchAssignments = () => api.get("/api/assignments");

export const fetchAssignment = (id: string) =>
  api.get(`/api/assignments/${id}`);

export const fetchResult = (assignmentId: string) =>
  api.get(`/api/results/${assignmentId}`);

export const downloadPdf = (assignmentId: string) =>
  api.get(`/api/assignments/${assignmentId}/pdf`, { responseType: 'blob' });

export const regenerateAssignment = (assignmentId: string, modifier: 'same' | 'harder' | 'easier' = 'same') =>
  api.post(`/api/assignments/${assignmentId}/regenerate`, { modifier }, { timeout: 120000 });

export const deleteAssignment = (id: string) =>
  api.delete(`/api/assignments/${id}`);

export default api;
