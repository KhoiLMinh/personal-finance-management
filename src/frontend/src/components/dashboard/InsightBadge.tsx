import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InsightBadgeProps {
  icon: LucideIcon;
  children: React.ReactNode;
}

export default function InsightBadge({ icon: Icon, children }: InsightBadgeProps) {
  return (
    <div
      className="d-flex align-items-start gap-2 p-3 rounded-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
    >
      <Icon size={18} className="mt-1 flex-shrink-0 text-white" />
      <span className="fw-medium text-white" style={{ opacity: 0.95 }}>{children}</span>
    </div>
  );
}