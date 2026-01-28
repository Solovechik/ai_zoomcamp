import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOverviewStats, getHabits } from '../services/api';
import { ICONS } from '../utils/constants';
import StreakBadge from '../components/StreakBadge';
import toast from 'react-hot-toast';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, habitsResponse] = await Promise.all([
          getOverviewStats(),
          getHabits()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        if (habitsResponse.success) {
          setHabits(habitsResponse.data);
        }
      } catch (err) {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const todayProgress = stats.todayTotal > 0
    ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
    : 0;

  // Sort habits by current streak
  const sortedHabits = [...habits].sort((a, b) => b.currentStreak - a.currentStreak);

  return (
    <div className="statistics-page">
      <h1>Statistics Overview</h1>

      <div className="overview-cards">
        <div className="overview-card">
          <div className="overview-value">{stats.todayCompleted}/{stats.todayTotal}</div>
          <div className="overview-label">Today's Progress</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${todayProgress}%` }} />
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-value">{stats.weeklyCompletionRate}%</div>
          <div className="overview-label">Weekly Rate</div>
        </div>

        <div className="overview-card">
          <div className="overview-value">{stats.monthlyCompletionRate}%</div>
          <div className="overview-label">Monthly Rate</div>
        </div>

        <div className="overview-card">
          <div className="overview-value">{stats.totalHabits}</div>
          <div className="overview-label">Total Habits</div>
        </div>
      </div>

      {stats.currentBestStreak?.streak > 0 && (
        <div className="best-streak-section">
          <h2>Best Active Streak</h2>
          <div className="best-streak-card">
            <StreakBadge streak={stats.currentBestStreak.streak} size="large" />
            <div className="best-streak-info">
              <span className="habit-name">{stats.currentBestStreak.habitName}</span>
              <span className="streak-days">{stats.currentBestStreak.streak} days</span>
            </div>
          </div>
        </div>
      )}

      <div className="habits-leaderboard">
        <h2>Habit Streaks</h2>
        {sortedHabits.length === 0 ? (
          <p className="no-habits">No habits to display</p>
        ) : (
          <div className="leaderboard-list">
            {sortedHabits.map((habit, index) => {
              const icon = ICONS.find(i => i.id === habit.icon) || ICONS[0];
              return (
                <Link
                  key={habit.id}
                  to={`/habits/${habit.id}`}
                  className="leaderboard-item"
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="habit-icon" style={{ color: habit.color }}>
                    {icon.emoji}
                  </span>
                  <span className="habit-name">{habit.name}</span>
                  <StreakBadge streak={habit.currentStreak} size="small" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
