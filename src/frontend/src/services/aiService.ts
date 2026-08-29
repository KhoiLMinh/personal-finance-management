import api from './api';

const aiService = {
  analyzeReport: async (startDate: string, endDate: string) => {
    const response = await api.get('/ai/analyze-report', { params: { startDate, endDate } });
    return response.data;
  },

  chatWithAi: async (message: string) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },

};

export const importService = {
  importCsv: async (walletId: number, file: File) => {
    const formData = new FormData();
    formData.append('walletId', walletId.toString());
    formData.append('file', file);

    const response = await api.post('/import-batches/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}

export default aiService;