import api from './api';

const savingGoalService = {
  getSavingGoals: async (params?: any) => {
    const response = await api.get('/saving-goals', { params });
    return response.data;
  },

  createGoal: async (data: any) => {
    const response = await api.post('/saving-goals', data);
    return response.data;
  },

  updateGoal: async (id: number, data: any) => {
    const response = await api.put(`/saving-goals/${id}`, data);
    return response.data;
  },

  addFunds: async (id: number, data: { amount: number, walletId: number }) => {
    const response = await api.patch(`/saving-goals/${id}/add-funds`, data);
    return response.data;
  },

  deleteGoal: async (id: number) => {
    const response = await api.delete(`/saving-goals/${id}`);
    return response.data;
  }
};

export default savingGoalService;