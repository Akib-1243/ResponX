import api from './api';

const photoService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/photos${query ? `?${query}` : ''}`);
  },

  saveMetadata: (photoData) => api.post('/photos', photoData),
};

export default photoService;
