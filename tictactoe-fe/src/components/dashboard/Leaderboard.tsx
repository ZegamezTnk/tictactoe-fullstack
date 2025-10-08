import React, { useEffect, useState } from "react";
import { Trophy, Medal, X, TrendingUp, Award } from "lucide-react";
import axios from "axios";

interface LeaderboardPlayer {
  user_id: string;
  name: string;
  picture?: string;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const { data } = await axios.get(`${API_URL}/api/leaderboard?limit=10`);
      setPlayers(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Medal className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-600 font-semibold">#{index + 1}</span>;
  };

  const getWinRate = (player: LeaderboardPlayer) => {
    if (player.total_games === 0) return 0;
    return Math.round((player.wins / player.total_games) * 100);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Leaderboard
                  </h2>
                  <p className="text-xs sm:text-sm text-white opacity-90">
                    Top 10 Players
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4 sm:p-6">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {!loading && !error && players.length === 0 && (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No players yet. Be the first!</p>
              </div>
            )}

            {!loading && !error && players.length > 0 && (
              <div className="space-y-2">
                {players.map((player, index) => {
                  const isCurrentUser = player.user_id === currentUserId;
                  const winRate = getWinRate(player);

                  return (
                    <div
                      key={player.user_id}
                      className={`
                        flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all
                        ${
                          index < 3
                            ? "bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                        ${
                          isCurrentUser
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : ""
                        }
                      `}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 sm:w-10 flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>

                      {/* Avatar */}
                      <img
                        src={
                          player.picture ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.user_id}`
                        }
                        alt={player.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                            {player.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {winRate}% Win Rate
                          </span>
                          <span>
                            {player.wins}W-{player.losses}L-{player.draws}D
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">
                          {player.score}
                        </div>
                        <div className="text-xs text-gray-600">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
