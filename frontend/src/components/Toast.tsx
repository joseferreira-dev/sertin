import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'var(--primary)',
    error: 'var(--danger)',
    info: 'var(--accent)',
    warning: 'var(--warning)',
  };

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    info: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-up"
      style={{
        background: 'var(--card)',
        border: `1px solid ${colors[type]}`,
        color: 'var(--foreground)',
        maxWidth: '400px',
      }}
    >
      <span style={{ color: colors[type] }}>{icons[type]}</span>
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}>
        <X size={14} />
      </button>
    </div>
  );
}
