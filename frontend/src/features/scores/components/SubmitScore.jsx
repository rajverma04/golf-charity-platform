import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitScoreFn } from '../api/scores.api';
import toast from 'react-hot-toast';

const SubmitScore = () => {
  const [score, setScore] = useState('');
  const [gameMode, setGameMode] = useState('Arcade');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitScoreFn,
    onSuccess: () => {
      toast.success('Score submitted successfully!');
      setScore('');
      // Invalidate queries so the leaderboard and user scores refetch
      queryClient.invalidateQueries({ queryKey: ['myScores'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit score');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(score);
    if (isNaN(num) || num < 1 || num > 45) {
      toast.error('Score must be between 1 and 45.');
      return;
    }
    mutation.mutate({ score: num, game_mode: gameMode });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Submit New Score</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input 
            type="number" 
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter score (1-45)"
            min="1"
            max="45"
            required
          />
        </div>
        <div className="sm:w-1/3">
          <select 
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Arcade">Arcade</option>
            <option value="Ranked">Ranked</option>
            <option value="Casual">Casual</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {mutation.isPending ? 'Submitting...' : 'Post Score'}
        </button>
      </form>
    </div>
  );
};

export default SubmitScore;
