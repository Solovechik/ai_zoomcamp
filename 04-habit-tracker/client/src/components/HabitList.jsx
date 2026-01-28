import HabitCard from './HabitCard';

export default function HabitList({ habits, onToggle, loading }) {
  if (loading) {
    return (
      <div className="habit-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading habits...</p>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="habit-list-empty">
        <p>No habits yet. Create your first habit to get started!</p>
      </div>
    );
  }

  return (
    <div className="habit-list">
      {habits.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
