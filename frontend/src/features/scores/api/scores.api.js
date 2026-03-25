import api from '../../../lib/axios';

export const getLeaderboardFn = async () => {
  const { data } = await api.get('/scores/leaderboard');
  return data.data; // array of top scores
};

export const getMyScoresFn = async () => {
  const { data } = await api.get('/scores');
  return data.data; // array of user's scores
};

export const submitScoreFn = async (scoreData) => {
  const { data } = await api.post('/scores', scoreData);
  return data.data;
};

export const editScoreFn = async ({ scoreId, score }) => {
  const { data } = await api.put(`/scores/${scoreId}`, { score });
  return data.data;
};
