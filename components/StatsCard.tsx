import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon, colorClass, onClick, isActive }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        p-6 rounded-xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-1
        ${isActive 
          ? `bg-slate-800 border-${colorClass.split('-')[1]}-500 ring-2 ring-${colorClass.split('-')[1]}-500 ring-opacity-50` 
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
        }
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass} bg-white`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white">{count.toLocaleString()}</span>
        <span className="text-slate-500 text-xs mb-1">users</span>
      </div>
    </div>
  );
};