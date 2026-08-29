import api from './api';

const aiService = {
  analyzeReport: async (startDate: string, endDate: string) => {
    const response = await api.get('/ai/analyze-report', { params: { startDate, endDate } });
    return response.data;
  },

  chatWithAi: async (message: string) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};

export const importService = {
  previewFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/import-batches/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  importData: async (walletId: number, dateCol: number, amountCol: number, descCol: number, file: File) => {
    const formData = new FormData();
    formData.append('walletId', walletId.toString());
    formData.append('dateCol', dateCol.toString());
    formData.append('amountCol', amountCol.toString());
    formData.append('descCol', descCol.toString());
    formData.append('file', file);

    const response = await api.post('/import-batches/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

export default aiService;