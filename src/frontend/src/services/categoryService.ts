import api from './api';

const categoryService = {
  getMyCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; type: string; color: string; icon: string }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;