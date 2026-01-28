export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function getToday() {
  return formatDate(new Date());
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function isSameDay(date1, date2) {
  return formatDate(new Date(date1)) === formatDate(new Date(date2));
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function getMonthString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
