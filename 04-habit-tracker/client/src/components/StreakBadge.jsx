export default function StreakBadge({ streak, size = 'medium' }) {
  if (streak === 0) return null;

  const sizeClasses = {
    small: 'streak-badge-sm',
    medium: 'streak-badge-md',
    large: 'streak-badge-lg'
  };

  const getIntensity = () => {
    if (streak >= 100) return 'streak-legendary';
    if (streak >= 30) return 'streak-hot';
    if (streak >= 7) return 'streak-warm';
    return '';
  };

  return (
    <span className={`streak-badge ${sizeClasses[size]} ${getIntensity()}`}>
      <span className="streak-icon">🔥</span>
      <span className="streak-count">{streak}</span>
    </span>
  );
}
