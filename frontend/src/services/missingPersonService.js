import api from './api.js';

const missingPersonService = {
  getAll: (params = {}) => api.get('/missing-persons', { params }),
  getById: (id) => api.get(`/missing-persons/${id}`),
  create: (data) => api.post('/missing-persons', data),
  markAsFound: (id) => api.patch(`/missing-persons/${id}/found`),
  delete: (id) => api.delete(`/missing-persons/${id}`),
};

export default missingPersonService;
