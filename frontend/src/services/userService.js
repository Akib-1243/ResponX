import api from './api';

const userService = {
  getData: () => api.get('/user/data'),
  getAll: () => api.get('/user/all'),
  createAdmin: (data) => api.post('/user/create-admin', data),
};

export default userService;
