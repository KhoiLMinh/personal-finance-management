import React from 'react';
import { Card } from 'react-bootstrap';
import type { LucideIcon } from 'lucide-react';

export type StatTone = 'primary' | 'danger' | 'success' | 'neutral';

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: StatTone;
  subtext?: string;
}

const TONE_STYLES: Record<StatTone, { fg: string; iconBg: string; iconFg: string }> = {
  primary: { fg: '#1d4ed8', iconBg: '#dbeafe', iconFg: '#2563eb' },
  danger:  { fg: '#dc2626', iconBg: '#fee2e2', iconFg: '#dc2626' },
  success: { fg: '#16a34a', iconBg: '#dcfce7', iconFg: '#16a34a' },
  neutral: { fg: '#0f172a', iconBg: '#e2e8f0', iconFg: '#334155' },
};

export default function StatCard({ label, value, icon: Icon, tone = 'primary', subtext }: StatCardProps) {
  const t = TONE_STYLES[tone];
  return (
    <Card className="border-0 rounded-4 h-100 shadow-soft">
      <Card.Body className="d-flex align-items-center gap-3 p-4">
        {Icon && (
          <div
            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
            style={{ width: 52, height: 52, backgroundColor: t.iconBg }}
          >
            <Icon size={24} color={t.iconFg} />
          </div>
        )}
        <div className="min-width-0">
          <div className="text-muted small fw-medium mb-1 text-truncate">{label}</div>
          <div className="fw-bolder text-truncate" style={{ fontSize: '1.75rem', color: t.fg }}>
            {value}
          </div>
          {subtext && <div className="text-muted small mt-1">{subtext}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}