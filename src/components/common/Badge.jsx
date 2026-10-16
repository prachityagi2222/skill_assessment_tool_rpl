import React from 'react';
import { CheckCircle2, Clock, Sparkles, AlertTriangle, UserCheck, ShieldCheck, FileText, Circle } from 'lucide-react';
import { getStatusMeta } from '../../utils/helpers';

const ICON_MAP = { CheckCircle2, Clock, Sparkles, AlertTriangle, UserCheck, ShieldCheck, FileText, Circle };

export const StatusBadge = ({ status }) => {
  const meta = getStatusMeta(status);
  const IconComponent = ICON_MAP[meta.icon] || Circle;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
      <IconComponent className="w-3.5 h-3.5" />
      <span>{meta.label}</span>
    </span>
  );
};

export const NsqfBadge = ({ level }) => {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md text-xs font-bold shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      NSQF Level {level}
    </span>
  );
};

export const TagBadge = ({ label, variant = 'slate' }) => {
  const variants = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${variants[variant] || variants.slate}`}>
      {label}
    </span>
  );
};
