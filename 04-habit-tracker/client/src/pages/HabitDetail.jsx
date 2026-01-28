import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHabit, getCompletions, updateHabit, deleteHabit, toggleCompletion } from '../services/api';
import { getMonthString, getToday } from '../utils/dateUtils';
import { ICONS } from '../utils/constants';
import CalendarView from '../components/CalendarView';
import StatsPanel from '../components/StatsPanel';
import HabitForm from '../components/HabitForm';
import toast from 'react-hot-toast';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchHabit = useCallback(async () => {
    try {
      const response = await getHabit(id);
      if (response.success) {
        setHabit(response.data);
      }
    } catch (err) {
      toast.error('Failed to load habit');
      navigate('/');
    }
  }, [id, navigate]);

  const fetchCompletions = useCallback(async (month) => {
    try {
      const monthStr = month ? getMonthString(month) : null;
      const response = await getCompletions(id, monthStr);
      if (response.success) {
        setCompletions(response.data.completions);
      }
    } catch (err) {
      console.error('Failed to fetch completions:', err);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchHabit();
      await fetchCompletions(new Date());
      setLoading(false);
    };
    loadData();
  }, [fetchHabit, fetchCompletions]);

  const handleToggleToday = async () => {
    if (!habit) return;
    try {
      await toggleCompletion(habit.id, getToday(), habit.completedToday);
      await fetchHabit();
      await fetchCompletions(new Date());
    } catch (err) {
      toast.error('Failed to update completion');
    }
  };

  const handleEdit = async (habitData) => {
    try {
      const response = await updateHabit(id, habitData);
      if (response.success) {
        setHabit(prev => ({ ...prev, ...response.data }));
        setShowEditForm(false);
        toast.success('Habit updated!');
      }
    } catch (err) {
      toast.error('Failed to update habit');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      await deleteHabit(id, true);
      toast.success('Habit deleted!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete habit');
    }
  };

  const handleMonthChange = (month) => {
    fetchCompletions(month);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!habit) {
    return null;
  }

  const icon = ICONS.find(i => i.id === habit.icon) || ICONS[0];

  return (
    <div className="habit-detail">
      <div className="detail-header" style={{ borderLeftColor: habit.color }}>
        <div className="detail-info">
          <button className="back-button" onClick={() => navigate('/')}>
            &larr; Back
          </button>
          <h1>
            <span className="habit-icon-large">{icon.emoji}</span>
            {habit.name}
          </h1>
          {habit.description && <p className="description">{habit.description}</p>}
        </div>
        <div className="detail-actions">
          <button
            className={`btn toggle-btn ${habit.completedToday ? 'completed' : ''}`}
            onClick={handleToggleToday}
            style={{
              backgroundColor: habit.completedToday ? habit.color : 'transparent',
              borderColor: habit.color,
              color: habit.completedToday ? 'white' : habit.color
            }}
          >
            {habit.completedToday ? '✓ Completed Today' : 'Mark Complete'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowEditForm(true)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>Statistics</h2>
          <StatsPanel stats={habit} />
        </div>

        <div className="detail-section">
          <h2>Completion History</h2>
          <CalendarView
            completions={completions}
            color={habit.color}
            onMonthChange={handleMonthChange}
          />
        </div>
      </div>

      {showEditForm && (
        <HabitForm
          habit={habit}
          onSubmit={handleEdit}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
