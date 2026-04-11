import api from './api.js';

const statsService = {
  getPublicStats: () => api.get('/stats'),
};

export default statsService;
