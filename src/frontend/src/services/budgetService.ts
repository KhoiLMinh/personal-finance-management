import api from './api';

const budgetService = {
  getBudgets: async (params?: any) => {
    const response = await api.get('/budgets', { params });
    return response.data;
  },

  createBudget: async (data: any) => {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  updateBudget: async (id: number, data: any) => {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  deleteBudget: async (id: number) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  }
};

export default budgetService;