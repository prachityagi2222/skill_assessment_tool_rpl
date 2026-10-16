import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md'
}) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      // Focus first interactive element for basic focus trap entry.
      const t = setTimeout(() => {
        dialogRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus?.();
      }, 0);
      const onKey = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      document.addEventListener('keydown', onKey);
      return () => {
        clearTimeout(t);
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
        // Return focus to the trigger on close.
        triggerRef.current?.focus?.();
      };
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col z-10 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-300`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 id={titleId} className="font-bold text-slate-900 text-base sm:text-lg leading-snug">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-sm text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};
