import api from './api';

export const musicService = {
  getReleases: async () => {
    const response = await api.get('/music/releases');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/music/stats');
    return response.data;
  }
};
