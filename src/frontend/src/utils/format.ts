export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
};
// yyyy-MM-dd in the browser's local timezone; toISOString() converts to UTC and shifts the day back in UTC+7
export const toLocalISODate = (d: Date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
