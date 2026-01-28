import { useState, useEffect } from 'react';
import { COLORS, ICONS, FREQUENCY_OPTIONS, DAY_NAMES } from '../utils/constants';

export default function HabitForm({ habit, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLORS[4], // green
    icon: 'check',
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6]
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        color: habit.color || COLORS[4],
        icon: habit.icon || 'check',
        frequency: habit.frequency || 'daily',
        targetDays: habit.targetDays || [0, 1, 2, 3, 4, 5, 6]
      });
    }
  }, [habit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleFrequencyChange = (freq) => {
    const option = FREQUENCY_OPTIONS.find(f => f.id === freq);
    setFormData(prev => ({
      ...prev,
      frequency: freq,
      targetDays: option?.days || prev.targetDays
    }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      targetDays: prev.targetDays.includes(day)
        ? prev.targetDays.filter(d => d !== day)
        : [...prev.targetDays, day].sort()
    }));
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{habit ? 'Edit Habit' : 'New Habit'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Morning Exercise"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {ICONS.map(icon => (
                <button
                  key={icon.id}
                  type="button"
                  className={`icon-option ${formData.icon === icon.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, icon: icon.id }))}
                  title={icon.label}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <div className="frequency-options">
              {FREQUENCY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className={`frequency-option ${formData.frequency === option.id ? 'selected' : ''}`}
                  onClick={() => handleFrequencyChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {formData.frequency === 'custom' && (
            <div className="form-group">
              <label>Select Days</label>
              <div className="day-picker">
                {DAY_NAMES.map((name, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`day-option ${formData.targetDays.includes(index) ? 'selected' : ''}`}
                    onClick={() => toggleDay(index)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
