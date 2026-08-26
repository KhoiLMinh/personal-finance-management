import api from './api';

const walletService = {
  getMyWallets: async () => {
    const response = await api.get('/wallets');
    return response.data; // Trả về List<WalletDTO>
  },

  createWallet: async (data: any) => {
    const response = await api.post('/wallets', data);
    return response.data;
  },

  updateWallet: async (id: number, data: any) => {
    const response = await api.put(`/wallets/${id}`, data);
    return response.data;
  },

  deleteWallet: async (id: number) => {
    const response = await api.delete(`/wallets/${id}`);
    return response.data;
  },

  getWalletMembers: async (walletId: number) => {
    const response = await api.get(`/wallets/${walletId}/members`);
    return response.data;
  },

  shareWallet: async (walletId: number, data: { email: string; permission: string }) => {
    const response = await api.post(`/wallets/${walletId}/members/share`, data);
    return response.data;
  }
};

export default walletService;