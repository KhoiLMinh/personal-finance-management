import { Button, ButtonGroup } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PeriodMode = 'MONTH' | 'YEAR';

export interface Period {
  mode: PeriodMode;
  month: number; // 1-12, ignored in YEAR mode
  year: number;
}

export const currentPeriod = (mode: PeriodMode = 'MONTH'): Period => {
  const now = new Date();
  return { mode, month: now.getMonth() + 1, year: now.getFullYear() };
};

export const periodLabel = (p: Period) => (p.mode === 'MONTH' ? `Tháng ${p.month}/${p.year}` : `Năm ${p.year}`);

const pad = (n: number) => String(n).padStart(2, '0');

/** Inclusive yyyy-MM-dd range for the backend's startDate/endDate params. */
export const periodRange = (p: Period) => {
  if (p.mode === 'YEAR') return { startDate: `${p.year}-01-01`, endDate: `${p.year}-12-31` };
  const lastDay = new Date(p.year, p.month, 0).getDate();
  return { startDate: `${p.year}-${pad(p.month)}-01`, endDate: `${p.year}-${pad(p.month)}-${pad(lastDay)}` };
};

const shift = (p: Period, step: number): Period => {
  if (p.mode === 'YEAR') return { ...p, year: p.year + step };
  const index = p.year * 12 + (p.month - 1) + step;
  return { ...p, year: Math.floor(index / 12), month: (index % 12) + 1 };
};

const isFuture = (p: Period) => {
  const now = currentPeriod(p.mode);
  return p.year > now.year || (p.mode === 'MONTH' && p.year === now.year && p.month > now.month);
};

interface PickerProps {
  value: Period;
  onChange: (p: Period) => void;
  /** Budgets are monthly only, so they hide the Tháng/Năm switch. */
  monthOnly?: boolean;
  /** Budgets can be planned ahead; reports cannot look into the future. */
  allowFuture?: boolean;
}

export default function PeriodPicker({ value, onChange, monthOnly = false, allowFuture = false }: PickerProps) {
  const next = shift(value, 1);
  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      {!monthOnly && <ButtonGroup size="sm" aria-label="Xem theo">
        {(['MONTH', 'YEAR'] as PeriodMode[]).map((mode) => (
          <Button
            key={mode}
            variant={value.mode === mode ? 'primary' : 'outline-secondary'}
            aria-pressed={value.mode === mode}
            onClick={() => onChange({ ...value, mode })}
          >
            {mode === 'MONTH' ? 'Tháng' : 'Năm'}
          </Button>
        ))}
      </ButtonGroup>}
      <div className="d-flex align-items-center">
        <Button size="sm" variant="link" className="text-secondary px-1" aria-label="Kỳ trước" onClick={() => onChange(shift(value, -1))}>
          <ChevronLeft size={18} />
        </Button>
        <span className="fw-semibold num text-center" style={{ minWidth: 112 }} aria-live="polite">{periodLabel(value)}</span>
        <Button
          size="sm"
          variant="link"
          className="text-secondary px-1"
          aria-label="Kỳ sau"
          disabled={!allowFuture && isFuture(next)}
          onClick={() => onChange(next)}
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
