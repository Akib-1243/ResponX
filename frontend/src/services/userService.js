import api from './api';

const userService = {
  getData: () => api.get('/user/data'),
  getAll: () => api.get('/user/all'),
  updateStatus: (id, status) => api.put(`/user/${id}/status`, { status }),
  createAdmin: (data) => api.post('/user/create-admin', data),
  remove: (id) => api.delete(`/user/${id}`),
};

export default userService;
