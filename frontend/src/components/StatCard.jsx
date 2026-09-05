import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  trendText, 
  isPositive = true, 
  icon: Icon, 
  colorVariant = 'blue',
  onClick
}) {
  const colorStyles = {
    blue: {
      card: 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800',
      iconBox: 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      trend: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      card: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800',
      iconBox: 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      trend: 'text-emerald-600 dark:text-emerald-400'
    },
    amber: {
      card: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-800',
      iconBox: 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      trend: 'text-amber-600 dark:text-amber-400'
    },
    rose: {
      card: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800',
      iconBox: 'bg-rose-100/80 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      trend: 'text-rose-600 dark:text-rose-400'
    }
  };

  const style = colorStyles[colorVariant] || colorStyles.blue;

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 ${style.card} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.iconBox}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value !== undefined ? Number(value).toLocaleString() : '—'}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          {title}
        </p>
      </div>

      {trendText && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {isPositive ? (
            <ArrowUpRight className={`w-3.5 h-3.5 ${style.trend}`} />
          ) : (
            <ArrowDownRight className={`w-3.5 h-3.5 ${style.trend}`} />
          )}
          <span className={style.trend}>{trendText}</span>
        </div>
      )}
    </div>
  );
}
