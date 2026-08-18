import api from './api';

const aiService = {
  analyzeReport: async (startDate, endDate) => {
    const response = await api.get('/ai/analyze-report', { params: { startDate, endDate } });
    return response.data;
  },

  chatWithAi: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },

  scanReceipt: async (file) => {
    const formData = new FormData();
    formData.append('file', file); 

    const response = await api.post('/ai/scan-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data; 
  }
};

export const importService = {
  importCsv: async (walletId, file) => {
    const formData = new FormData();
    formData.append('walletId', walletId);
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