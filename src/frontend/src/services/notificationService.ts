import api from './api';

const notificationService = {
  getMyNotifications: async (params?: { page: number, size: number }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (id: number) => {
    await api.delete(`/notifications/${id}`);
  }
};

export default notificationService;