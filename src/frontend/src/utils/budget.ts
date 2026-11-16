export type UsageLevel = 'ok' | 'warning' | 'over';

/**
 * Presentation of a budget's usage. Thresholds mirror BudgetServiceImpl#evaluateBudget
 * (spent >= limit -> exceeded, spent >= warning% -> warning) so the UI and the backend alerts agree.
 */
export function getBudgetUsage(limit: number, spent: number, warningPercent?: number | null) {
  const percent = limit > 0 ? (spent / limit) * 100 : 0;
  const warn = warningPercent ?? 80;
  const level: UsageLevel = spent >= limit ? 'over' : percent >= warn ? 'warning' : 'ok';
  return {
    percent,
    // floor, not round: 99.6% must not read as "100%" next to a "not exceeded" state
    percentLabel: `${Math.floor(percent)}%`,
    barPercent: Math.min(100, percent),
    remaining: limit - spent,
    level,
  };
}

export const usageText: Record<UsageLevel, string> = {
  ok: 'Trong hạn mức',
  warning: 'Sắp chạm hạn mức',
  over: 'Đã vượt hạn mức',
};
