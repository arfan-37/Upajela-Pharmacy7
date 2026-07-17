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