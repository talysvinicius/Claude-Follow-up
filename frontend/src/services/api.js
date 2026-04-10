import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refresh,
          });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  updateMe: (data) => api.patch("/auth/me", data),
};

// Leads
export const leadsApi = {
  list: (params) => api.get("/leads", { params }),
  create: (data) => api.post("/leads", data),
  get: (id) => api.get(`/leads/${id}`),
  update: (id, data) => api.patch(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  stats: () => api.get("/leads/stats/summary"),
};

// Cadences
export const cadencesApi = {
  list: () => api.get("/cadences"),
  create: (data) => api.post("/cadences", data),
  get: (id) => api.get(`/cadences/${id}`),
  update: (id, data) => api.patch(`/cadences/${id}`, data),
  delete: (id) => api.delete(`/cadences/${id}`),
  enroll: (id, data) => api.post(`/cadences/${id}/enroll`, data),
  enrollments: (id) => api.get(`/cadences/${id}/enrollments`),
};

// Lessons
export const lessonsApi = {
  categories: () => api.get("/lessons/categories"),
  list: (params) => api.get("/lessons", { params }),
  get: (slug) => api.get(`/lessons/${slug}`),
  updateProgress: (id, data) => api.post(`/lessons/${id}/progress`, data),
  myProgress: () => api.get("/lessons/progress/my"),
};

// Stripe
export const stripeApi = {
  checkout: (plan) => api.post("/stripe/checkout", { plan }),
  portal: () => api.post("/stripe/portal"),
};

// Pipedrive
export const pipedriveApi = {
  persons: () => api.get("/pipedrive/persons"),
  deals: () => api.get("/pipedrive/deals"),
  syncPersons: (limit) => api.post("/pipedrive/sync-persons", { limit }),
  pushLead: (lead_id) => api.post("/pipedrive/push-lead", { lead_id }),
};

export default api;
