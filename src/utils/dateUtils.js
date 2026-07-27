export const normalizeDate = (value) => {
  if (!value) return '';
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return str;
};

export const formatDateOnly = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const addDaysToDateOnly = (dateOnly, days) => {
  const baseDate = new Date(`${dateOnly}T00:00:00`);
  baseDate.setDate(baseDate.getDate() + days);

  return formatDateOnly(baseDate);
};