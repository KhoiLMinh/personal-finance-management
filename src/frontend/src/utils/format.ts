export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
};
// yyyy-MM-dd in the browser's local timezone; toISOString() converts to UTC and shifts the day back in UTC+7
export const toLocalISODate = (d: Date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Axis ticks: 1.250.000 -> "1,25 tr"; full figures stay in tooltips and labels
export const formatMillions = (amount: number) =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format((amount || 0) / 1_000_000)} tr`;

export const formatDayLabel = (isoDate: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric' }).format(new Date(`${isoDate}T00:00:00`));
