import api from '../../../lib/axios';

export const getAllUsersFn = async () => {
  const { data } = await api.get('/admin/users');
  return data.data; // array of users (with subs)
};

export const getPendingWinnersFn = async () => {
  const { data } = await api.get('/admin/winners');
  return data.data; // array of winners
};

// Reuse existing charities fetching from general api
// but add the admin mutation ones here:
export const createCharityFn = async (payload) => {
  const { data } = await api.post('/admin/charities', payload);
  return data.data;
};

export const updateCharityFn = async ({ id, payload }) => {
  const { data } = await api.put(`/admin/charities/${id}`, payload);
  return data.data;
};

export const deleteCharityFn = async (id) => {
  const { data } = await api.delete(`/admin/charities/${id}`);
  return data;
};

// Also reuse verifyWinner from the user backend controllers but mounted correctly?
// Wait, verifyWinner was mounted on /admin/draw/verify ? Let me check.
// In user.routes: router.post('/admin/winner/verify', adminMiddleware, verifyWinner);
export const verifyWinnerFn = async ({ winnerId, status }) => {
  const { data } = await api.post('/admin/winner/verify', { winnerId, status });
  return data.data;
};
