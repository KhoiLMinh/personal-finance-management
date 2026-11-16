import type { ReactNode } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Inline states for a page or a panel; unlike MySpinner they never force a full viewport height.

export function LoadingState({ label = 'Đang tải dữ liệu…', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div role="status" className={`d-flex align-items-center justify-content-center gap-2 text-secondary ${compact ? 'py-4' : 'py-5'}`}>
      <Spinner animation="border" size="sm" />
      <span className="small">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-4 px-3">
      <div className="fw-semibold">{title}</div>
      {description && <div className="small text-secondary mt-1 mx-auto" style={{ maxWidth: 360 }}>{description}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Không tải được dữ liệu. Kiểm tra kết nối rồi thử lại.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="d-flex flex-column align-items-center text-center gap-2 py-4 px-3">
      <AlertCircle size={20} className="text-danger-strong" aria-hidden />
      <div className="small">{message}</div>
      {onRetry && (
        <Button size="sm" variant="outline-secondary" onClick={onRetry} className="d-inline-flex align-items-center gap-1">
          <RefreshCw size={14} aria-hidden /> Thử lại
        </Button>
      )}
    </div>
  );
}
