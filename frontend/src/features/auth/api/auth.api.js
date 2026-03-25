import api from '../../../lib/axios';

export const loginFn = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const signupFn = async (userInfo) => {
  const { data } = await api.post('/auth/signup', userInfo);
  return data;
};

export const logoutFn = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const updateProfileFn = async (userInfo) => {
  const { data } = await api.put('/auth/profile', userInfo);
  return data;
};
