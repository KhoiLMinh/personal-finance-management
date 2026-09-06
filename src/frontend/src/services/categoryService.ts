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
  },
  getCategoryRules: async (categoryId: number) => {
    const response = await api.get(`/categories/${categoryId}/rules`);
    return response.data;
  },

  addCategoryRule: async (categoryId: number, data: { keyword: string; priority: number }) => {
    const response = await api.post(`/categories/${categoryId}/rules`, data);
    return response.data;
  },

  deleteCategoryRule: async (categoryId: number, ruleId: number) => {
    const response = await api.delete(`/categories/${categoryId}/rules/${ruleId}`);
    return response.data;
  },
  updateCategory: async (id: number, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  hideCategory: async (id: number) => {
    const response = await api.patch(`/categories/${id}/hide`);
    return response.data;
  },

  unhideCategory: async (id: number) => {
    const response = await api.patch(`/categories/${id}/unhide`);
    return response.data;
  },
};

export default categoryService;