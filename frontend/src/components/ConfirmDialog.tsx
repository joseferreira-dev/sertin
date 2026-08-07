interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,9,13,0.8)' }}
    >
      <div
        className="w-80 rounded-xl p-6"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
            style={{
              background: variant === 'danger' ? 'var(--danger)' : 'var(--primary)',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
