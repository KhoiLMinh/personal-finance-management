import api from './api';

const reportService = {
  getOverview: async (startDate, endDate) => {
    const response = await api.get('/report/overview', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  downloadExcel: async (startDate, endDate, walletId = null) => {
    const response = await api.get('/report/excel', {
      params: { startDate, endDate, walletId },
      responseType: 'blob', 
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sao-ke-${startDate}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadPdf: async (startDate, endDate, walletId = null) => {
    const response = await api.get('/report/pdf', {
      params: { startDate, endDate, walletId },
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sao-ke-${startDate}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default reportService;