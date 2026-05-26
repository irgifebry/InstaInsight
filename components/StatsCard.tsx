import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  isActive?: boolean;
  activeBgColor?: string;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  icon,
  isActive,
  activeBgColor = '#e2e8f0',
  onClick,
}) => {
  return (
    <div
      id={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className="relative p-5 cursor-pointer transition-all duration-150 h-full flex flex-col justify-between hover:translate-y-[-1px]"
      style={{
        background: isActive ? activeBgColor : '#131824',
        border: '3px solid #f8fafc',
        boxShadow: '4px 4px 0 #000000',
        borderRadius: '16px',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2.5"
          style={{
            background: isActive ? '#131824' : '#1e293b',
            border: '2px solid #f8fafc',
            boxShadow: '2px 2px 0 #000000',
            borderRadius: '8px',
          }}
        >
          {icon}
        </div>
        <div
          className="text-xs font-black uppercase tracking-widest px-2 py-1"
          style={{
            color: isActive ? '#e2e8f0' : '#f8fafc',
            background: isActive ? '#131824' : '#1e293b',
            border: '2px solid #f8fafc',
            boxShadow: '2px 2px 0 #000000',
            borderRadius: '6px',
          }}
        >
          {isActive ? 'Active' : 'View'}
        </div>
      </div>

      <div className="mt-2">
        <p
          className="text-4xl font-black tracking-tight"
          style={{ color: isActive ? '#090b11' : '#f8fafc' }}
        >
          {count.toLocaleString()}
        </p>
        <p
          className="text-xs font-bold uppercase tracking-widest mt-1"
          style={{ color: isActive ? '#090b11' : '#f8fafc', opacity: isActive ? 0.9 : 0.75 }}
        >
          {title}
        </p>
      </div>
    </div>
  );
};
