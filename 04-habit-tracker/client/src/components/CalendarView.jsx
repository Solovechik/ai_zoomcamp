import { useState, useEffect } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, formatMonthYear, addMonths, formatDate, isToday } from '../utils/dateUtils';
import { DAY_NAMES } from '../utils/constants';

export default function CalendarView({ completions, color, onMonthChange }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentMonth);
    }
  }, [currentMonth, onMonthChange]);

  const navigateMonth = (delta) => {
    setCurrentMonth(prev => addMonths(prev, delta));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const completionSet = new Set(completions);

  const days = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const isCompleted = completionSet.has(dateStr);
    const isTodayDate = isToday(date);

    days.push(
      <div
        key={day}
        className={`calendar-day ${isCompleted ? 'completed' : ''} ${isTodayDate ? 'today' : ''}`}
        style={isCompleted ? { backgroundColor: color, borderColor: color } : {}}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={() => navigateMonth(-1)}>
          &lt;
        </button>
        <span className="calendar-title">{formatMonthYear(currentMonth)}</span>
        <button className="calendar-nav" onClick={() => navigateMonth(1)}>
          &gt;
        </button>
      </div>
      <div className="calendar-weekdays">
        {DAY_NAMES.map(name => (
          <div key={name} className="calendar-weekday">{name}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days}
      </div>
    </div>
  );
}
