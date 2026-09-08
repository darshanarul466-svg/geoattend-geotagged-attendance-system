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
      iconBox: 'bg-[#FAF5EE] dark:bg-[#25201C] text-[#E76F51]',
      trend: 'text-[#E76F51]'
    },
    green: {
      iconBox: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#193B2D] dark:text-emerald-400',
      trend: 'text-emerald-700 dark:text-emerald-400'
    },
    amber: {
      iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
      trend: 'text-amber-700 dark:text-amber-400'
    },
    rose: {
      iconBox: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
      trend: 'text-rose-600 dark:text-rose-400'
    }
  };

  const style = colorStyles[colorVariant] || colorStyles.blue;

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-3xl bg-white dark:bg-[#16191F] border border-[#ECE7DF] dark:border-[#272D38] shadow-2xs transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-[#DDD6CB] dark:hover:border-slate-700 hover:shadow-xs' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${style.iconBox}`}>
          {Icon && <Icon className="w-5 h-5 stroke-[2]" />}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-white">
          {value !== undefined ? Number(value).toLocaleString() : '—'}
        </h3>
        <p className="text-xs font-semibold text-[#71717A] dark:text-[#9CA3AF] mt-1">
          {title}
        </p>
      </div>

      {trendText && (
        <div className="mt-3 flex items-center gap-1 text-[11px] font-medium">
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
