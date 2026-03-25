import api from '../../../lib/axios';

export const getLatestDrawFn = async () => {
  const { data } = await api.get('/draw/latest');
  return data.data; // { id, month, numbers, winners: [] }
};

export const runDrawFn = async (type = 'random') => {
  const { data } = await api.post('/admin/draw/run', { type });
  return data.data; // { id, status: 'draft', ... }
};

export const publishDrawFn = async (drawId) => {
  const { data } = await api.post('/admin/draw/publish', { drawId });
  return data.data; 
};
