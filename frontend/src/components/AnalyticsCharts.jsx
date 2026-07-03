import React from 'react';

// 1. Room Occupancy Donut Chart
export const OccupancyDonut = ({ occupied, capacity }) => {
  const percentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card flex flex-col items-center justify-center min-h-[280px]">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 self-start">Room Occupancy</h4>
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-primary"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-2xl font-black text-slate-800 dark:text-white">{percentage}%</span>
          <p className="text-[9px] text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider">Occupied</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-6 w-full text-center">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{occupied}</span>
          <p className="text-[9px] text-slate-400 font-medium">Beds Taken</p>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{capacity - occupied}</span>
          <p className="text-[9px] text-slate-400 font-medium">Beds Free</p>
        </div>
      </div>
    </div>
  );
};

// 2. Fee Collection Monthly Bar Chart
export const FeeCollectionChart = ({ collectionData = [12000, 24000, 18000, 35000, 28000, 48000, 52000] }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const maxValue = Math.max(...collectionData, 10000);
  const chartHeight = 120;

  return (
    <div className="glass-card flex flex-col justify-between min-h-[280px]">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Fee Collections (Monthly)</h4>
      
      {/* Bars container */}
      <div className="flex items-end justify-between h-[120px] px-2 relative border-b border-slate-100 dark:border-slate-800 pb-2">
        {collectionData.map((val, idx) => {
          const heightPercentage = (val / maxValue) * chartHeight;
          return (
            <div key={idx} className="flex flex-col items-center group relative flex-1">
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 font-bold whitespace-nowrap shadow-md">
                INR {val.toLocaleString()}
              </div>
              {/* Bar */}
              <div
                className="w-8 bg-gradient-to-t from-primary/80 to-primary group-hover:to-secondary rounded-t-lg transition-all duration-500 cursor-pointer"
                style={{ height: `${heightPercentage}px` }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-2 pt-2 text-slate-400 dark:text-slate-400 font-bold text-[9px] uppercase tracking-wider">
        {months.map((m, idx) => (
          <span key={idx} className="w-8 text-center">{m}</span>
        ))}
      </div>
    </div>
  );
};

// 3. Complaints Distribution Progress Bars
export const ComplaintsDistribution = ({ complaints = [] }) => {
  // Count categories
  const categories = ['internet', 'electrical', 'water', 'furniture', 'cleaning', 'security', 'others'];
  const counts = {};
  categories.forEach(c => { counts[c] = 0; });
  
  complaints.forEach(c => {
    if (counts[c.type] !== undefined) {
      counts[c.type] += 1;
    } else {
      counts['others'] = (counts['others'] || 0) + 1;
    }
  });

  const total = complaints.length || 1;

  return (
    <div className="glass-card flex flex-col min-h-[280px]">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Complaints Breakdown</h4>
      <div className="space-y-4 flex-1 justify-center flex flex-col">
        {categories.map((cat, idx) => {
          const count = counts[cat] || 0;
          const percentage = Math.round((count / total) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 capitalize">
                <span>{cat}</span>
                <span>{count} ({percentage}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-orange-400 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
