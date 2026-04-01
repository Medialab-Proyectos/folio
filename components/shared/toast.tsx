'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-success text-white shadow-success/25',
    error: 'bg-destructive text-white shadow-destructive/25',
    info: 'bg-foreground text-background shadow-foreground/25',
  };

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
        isExiting 
          ? 'opacity-0 -translate-y-2 scale-95' 
          : 'opacity-100 translate-y-0 scale-100 animate-slide-in-bottom'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className={`${styles[type]} rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-3 min-w-[300px] max-w-md backdrop-blur-xl`}>
        <div className="flex-shrink-0 animate-scale-in">
          {icons[type]}
        </div>
        <p className="flex-1 text-sm font-medium leading-tight">
          {message}
        </p>
        <button 
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity active:scale-90 p-0.5 min-h-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
