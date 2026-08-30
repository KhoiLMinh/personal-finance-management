import api from './api';

const recurringBillService = {
  getBills: async (params?: any) => {
    const response = await api.get('/recurring-bills', { params });
    return response.data;
  },
  createBill: async (data: any) => {
    const response = await api.post('/recurring-bills', data);
    return response.data;
  },
  deleteBill: async (id: number) => {
    const response = await api.delete(`/recurring-bills/${id}`);
    return response.data;
  }
};

export default recurringBillService;