import api from './api';

const aidRequestService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/requests${query ? `?${query}` : ''}`);
  },

  getOne: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  update: (id, data) => api.put(`/requests/${id}`, data),
  accept: (id) => api.put(`/requests/${id}/accept`),
  complete: (id) => api.put(`/requests/${id}/complete`),
  remove: (id) => api.delete(`/requests/${id}`),
};

export default aidRequestService;
