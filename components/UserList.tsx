import React, { useState, useMemo } from 'react';
import { Download, Frown, Search, ExternalLink } from 'lucide-react';
import { InstagramUser } from '../types';

interface UserListProps {
  users: InstagramUser[];
  title: string;
  accentColor: string;
  onExport?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ users, title, accentColor, onExport }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const openInstagram = (username: string) => {
    window.open(`https://instagram.com/${username}`, '_blank');
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'rgba(19,24,36,0.95)', border: '1px solid rgba(255,255,255,0.07)', height: '580px' }}>
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,252,0.45)' }}>
              {users.length} accounts found
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onExport && users.length > 0 && (
              <button
                id="export-csv-btn"
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  background: `${accentColor}22`,
                  color: accentColor,
                  border: `1px solid ${accentColor}44`,
                }}
              >
                <Download size={13} strokeWidth={2.5} />
                Export CSV
              </button>
            )}
            <div className="relative flex-1 sm:w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.35)' }} strokeWidth={2.5} />
              <input
                id="user-search-input"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'rgba(248,250,252,0.3)' }}>
            <Frown size={44} strokeWidth={1.5} />
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredUsers.map((user, idx) => (
              <div
                key={`${user.username}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl group transition-all duration-200 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = `${accentColor}18`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}44`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <div
                    className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)` }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate text-white/80 group-hover:text-white transition-colors">
                    @{user.username}
                  </span>
                </div>

                <button
                  onClick={() => openInstagram(user.username)}
                  className="flex-shrink-0 ml-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  style={{ background: `${accentColor}22`, color: accentColor }}
                  title="Open profile"
                >
                  <ExternalLink size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};