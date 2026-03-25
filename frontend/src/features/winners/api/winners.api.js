import api from '../../../lib/axios';

export const uploadProofFn = async ({ drawId, fileUrl }) => {
  const { data } = await api.post('/winner/upload-proof', { drawId, fileUrl });
  return data.data;
};
