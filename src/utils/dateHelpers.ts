export const formatLocalISO = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getTodayISO = () => formatLocalISO(new Date());

export const getMonthName = (monthIndex: number) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, monthIndex, 1));
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};
