import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  icon,
  gradientFrom,
  gradientTo,
  isActive,
  onClick,
}) => {
  return (
    <div
      id={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 group
        ${isActive
          ? 'ring-2 ring-white/30 shadow-2xl scale-[1.02]'
          : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
        }
      `}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
          : 'rgba(19,24,36,0.9)',
        border: isActive ? 'none' : `1px solid ${gradientFrom}33`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}22)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: isActive ? 'rgba(255,255,255,0.2)' : `${gradientFrom}22`,
            }}
          >
            {icon}
          </div>
          <div
            className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
            style={{
              color: isActive ? 'white' : gradientFrom,
              background: isActive ? 'rgba(255,255,255,0.15)' : `${gradientFrom}18`,
            }}
          >
            {isActive ? 'Active' : 'View'}
          </div>
        </div>

        <div className="mt-2">
          <p
            className="text-4xl font-black tracking-tight"
            style={{ color: isActive ? 'white' : gradientFrom }}
          >
            {count.toLocaleString()}
          </p>
          <p
            className="text-xs font-semibold uppercase tracking-widest mt-1"
            style={{ color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(248,250,252,0.5)' }}
          >
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};