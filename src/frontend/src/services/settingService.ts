import api from './api';

const settingService = {
  getAllSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSetting: async (key: string, value: string) => {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data;
  }
};

export default settingService;