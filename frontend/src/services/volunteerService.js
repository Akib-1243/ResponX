import api from './api';

const volunteerService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/tasks${query ? `?${query}` : ''}`);
  },

  create: (data) => api.post('/tasks', data),
  toggleAssign: (id) => api.put(`/tasks/${id}/assign`),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export default volunteerService;
