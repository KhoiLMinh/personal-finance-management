import type { SavingGoal } from '../types/finance';

export const GOAL_SOON_DAYS = 30;

/** Whole days from today (local) to an ISO date; negative when the date has passed. */
export const daysUntil = (iso: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
};

export type GoalState = 'done' | 'cancelled' | 'overdue' | 'soon' | 'active';

export function goalState(g: SavingGoal) {
  const days = daysUntil(g.deadline);
  const percent = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
  const state: GoalState =
    g.status === 'COMPLETE' ? 'done'
      : g.status === 'CANCELLED' ? 'cancelled'
        : days < 0 ? 'overdue'
          : days <= GOAL_SOON_DAYS ? 'soon' : 'active';
  const label = {
    done: 'Hoàn thành',
    cancelled: 'Đã hủy',
    overdue: `Quá hạn ${-days} ngày`,
    soon: days === 0 ? 'Đến hạn hôm nay' : `Còn ${days} ngày`,
    active: `Còn ${days} ngày`,
  }[state];
  const pill = { done: 'ok', cancelled: 'neutral', overdue: 'over', soon: 'warning', active: 'neutral' }[state];
  return { state, days, percent: Math.floor(percent), remaining: Math.max(0, g.targetAmount - g.currentAmount), label, pill };
}
