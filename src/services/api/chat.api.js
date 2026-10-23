import { api } from "./api";

export const chatApi = {
  contacts: () => api.get("/chat/contacts"),
  messages: (userId) => api.get(`/chat/with/${userId}`),
  sendMessage: (userId, text) => api.post(`/chat/with/${userId}`, { text }),
};
