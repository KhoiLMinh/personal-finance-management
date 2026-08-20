import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { fullName: string; avatar?: string }) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  }
};

export default userService;