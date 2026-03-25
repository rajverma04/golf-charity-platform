import api from '../../../lib/axios';

export const createSubscriptionFn = async (plan) => {
  const { data } = await api.post('/subscription/create', { plan });
  return data.data; // { checkoutUrl }
};

export const getSubscriptionStatusFn = async () => {
  const { data } = await api.get('/subscription/status');
  return data.data; // { status, expiresAt }
};
