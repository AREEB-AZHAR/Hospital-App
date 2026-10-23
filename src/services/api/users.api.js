import { api } from "./api";

export const usersApi = {
  doctors: () => api.get("/users/doctors"),
  me: () => api.get("/users/me"),
  updateMe: (data) => api.patch("/users/me", data),
  allUsers: (params = "") => api.get(`/users/all${params ? `?${params}` : ""}`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  createStaff: (data) => api.post("/users/staff", data),
};

