import api from './api';

const transactionService = {
  getTransactions: async (params: any) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  createTransaction: async (data: any) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  updateTransaction: async (id: number, data: any) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: number) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};

export default transactionService;