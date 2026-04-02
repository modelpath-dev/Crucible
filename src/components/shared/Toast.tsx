import React, { useEffect } from 'react';
import { create } from 'zustand';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    set(state => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    if (duration > 0) {
      setTimeout(() => {
        set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      }, duration);
    }
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

const typeStyles: Record<string, string> = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
};

function ToastItem({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore(s => s.removeToast);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded border text-sm shadow-lg animate-in slide-in-from-bottom ${typeStyles[toast.type]}`}
      onClick={() => removeToast(toast.id)}
    >
      <span className="flex-1">{toast.message}</span>
      <button className="opacity-50 hover:opacity-100">×</button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
