import api from './api';

export const backupService = {
  exportData: async (): Promise<void> => {
    const response = await api.get('/data/export', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'personal_finance_backup.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  restoreData: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/data/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};