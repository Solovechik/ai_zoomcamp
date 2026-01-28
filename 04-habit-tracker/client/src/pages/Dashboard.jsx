import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import HabitList from '../components/HabitList';
import HabitForm from '../components/HabitForm';

export default function Dashboard() {
  const { habits, loading, addHabit, toggleCompletion } = useHabits();
  const [showForm, setShowForm] = useState(false);

  const today = new Date();
  const todayDayNum = today.getDay();

  // Filter habits for today
  const todaysHabits = habits.filter(h => h.targetDays.includes(todayDayNum));
  const completedToday = todaysHabits.filter(h => h.completedToday).length;

  const handleCreateHabit = async (habitData) => {
    try {
      await addHabit(habitData);
      setShowForm(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Today's Habits</h1>
          <p className="date-subtitle">
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Habit
        </button>
      </div>

      {!loading && todaysHabits.length > 0 && (
        <div className="progress-summary">
          <div className="progress-text">
            {completedToday} of {todaysHabits.length} completed
          </div>
          <div className="progress-bar large">
            <div
              className="progress-fill"
              style={{
                width: `${todaysHabits.length > 0 ? (completedToday / todaysHabits.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      <HabitList
        habits={todaysHabits}
        onToggle={toggleCompletion}
        loading={loading}
      />

      {showForm && (
        <HabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
