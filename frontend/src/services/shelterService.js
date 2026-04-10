import api from './api';

const shelterService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/shelters${query ? `?${query}` : ''}`);
  },

  getOne: (id) => api.get(`/shelters/${id}`),
  create: (data) => api.post('/shelters', data),
  update: (id, data) => api.put(`/shelters/${id}`, data),
  remove: (id) => api.delete(`/shelters/${id}`),
};

export default shelterService;
