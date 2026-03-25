import api from '../../../lib/axios';

export const getCharitiesFn = async () => {
  const { data } = await api.get('/charities');
  return data.data; // array of charities { id, name, description, website_url }
};

export const selectCharityFn = async ({ charityId, percentage }) => {
  const { data } = await api.post('/user/charity', { charityId, percentage });
  return data.data;
};
