import { useNavigate } from 'react-router-dom';
import StreakBadge from './StreakBadge';
import { ICONS } from '../utils/constants';

export default function HabitCard({ habit, onToggle }) {
  const navigate = useNavigate();
  const icon = ICONS.find(i => i.id === habit.icon) || ICONS[0];

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(habit.id);
  };

  const handleClick = () => {
    navigate(`/habits/${habit.id}`);
  };

  return (
    <div
      className="habit-card"
      onClick={handleClick}
      style={{ borderLeftColor: habit.color }}
    >
      <div className="habit-card-left">
        <button
          className={`completion-toggle ${habit.completedToday ? 'completed' : ''}`}
          onClick={handleToggle}
          style={{
            backgroundColor: habit.completedToday ? habit.color : 'transparent',
            borderColor: habit.color
          }}
        >
          {habit.completedToday && <span className="check-mark">✓</span>}
        </button>
        <div className="habit-info">
          <div className="habit-name">
            <span className="habit-icon">{icon.emoji}</span>
            {habit.name}
          </div>
          {habit.description && (
            <div className="habit-description">{habit.description}</div>
          )}
        </div>
      </div>
      <div className="habit-card-right">
        <StreakBadge streak={habit.currentStreak} />
      </div>
    </div>
  );
}
