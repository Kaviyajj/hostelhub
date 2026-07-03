import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  // Setup color themes
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50',
      gradient: 'from-blue-500 to-indigo-500'
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/20',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-100 dark:border-teal-900/50',
      gradient: 'from-teal-500 to-emerald-500'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-100 dark:border-orange-900/50',
      gradient: 'from-orange-500 to-amber-500'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/50',
      gradient: 'from-rose-500 to-pink-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/50',
      gradient: 'from-purple-500 to-violet-500'
    }
  };

  const selected = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between p-6">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </span>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
          {value}
        </h3>
        {description && (
          <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
            {description}
          </p>
        )}
      </div>
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected.bg} border ${selected.border}`}>
        <Icon className={`w-6 h-6 ${selected.text}`} />
      </div>
    </div>
  );
};

export default StatCard;
