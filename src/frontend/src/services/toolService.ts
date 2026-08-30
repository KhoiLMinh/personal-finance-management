import api from './api';

const toolService = {
  calculateLoanInterest: async (data: { principal: number, annualRate: number, months: number, type: string }) => {
    const response = await api.post('/tools/loan-calculator', data);
    return response.data;
  },

  convertCurrency: async (from: string, to: string, amount: number) => {
    const response = await api.get('/tools/currency-converter', {
      params: { from, to, amount }
    });
    return response.data;
  }
};

export default toolService;