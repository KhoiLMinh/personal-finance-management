import api from './api';

const categoryService = {
  getMyCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export default categoryService;