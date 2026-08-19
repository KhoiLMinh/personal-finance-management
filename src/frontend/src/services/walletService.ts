import api from './api';

const walletService = {
  getMyWallets: async () => {
    const response = await api.get('/wallets');
    return response.data;
  }
};

export default walletService;