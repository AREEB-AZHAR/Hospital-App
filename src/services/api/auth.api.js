import { api } from "./api";

export const authApi = {
  register(data) {
    return api.post("/auth/register", data);
  },

  login(data) {
    return api.post("/auth/login", data);
  },

  forgotPassword(phone) {
    return api.post("/auth/forgot-password", { phone });
  },

  resetPassword({ phone, otp, newPassword }) {
    return api.post("/auth/reset-password", { phone, otp, newPassword });
  },
};
