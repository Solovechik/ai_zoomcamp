import StreakBadge from './StreakBadge';

export default function StatsPanel({ stats }) {
  const {
    currentStreak = 0,
    longestStreak = 0,
    totalCompletions = 0,
    completionRate = 0
  } = stats || {};

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-value">
          <StreakBadge streak={currentStreak} size="large" />
          {currentStreak === 0 && <span className="stat-number">0</span>}
        </div>
        <div className="stat-label">Current Streak</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          <span className="stat-number">{longestStreak}</span>
        </div>
        <div className="stat-label">Longest Streak</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          <span className="stat-number">{totalCompletions}</span>
        </div>
        <div className="stat-label">Total Completions</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          <span className="stat-number">{completionRate}%</span>
        </div>
        <div className="stat-label">Completion Rate</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, completionRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
