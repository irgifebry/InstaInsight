import React, { useState, useMemo } from 'react';
import { Download, Frown, Search, ExternalLink } from 'lucide-react';
import { InstagramUser } from '../types';

interface UserListProps {
  users: InstagramUser[];
  title: string;
  onExport?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ users, title, onExport }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const openInstagram = (username: string) => {
    window.open(`https://instagram.com/${username}`, '_blank');
  };

  return (
    <div className="flex flex-col" style={{ background: '#131824', height: '580px' }}>
      <div className="p-5" style={{ borderBottom: '3px solid #f8fafc' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-50 leading-tight uppercase tracking-tight">{title}</h2>
            <p className="text-xs mt-1 font-bold" style={{ color: 'rgba(248,250,252,0.7)' }}>
              {users.length} accounts found
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onExport && users.length > 0 && (
              <button
                id="export-csv-btn"
                onClick={onExport}
                className="neo-btn neo-btn-primary flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wide"
              >
                <Download size={13} strokeWidth={2.5} />
                Export CSV
              </button>
            )}
            <div className="relative flex-1 sm:w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-50" strokeWidth={2.5} />
              <input
                id="user-search-input"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="neo-input w-full pl-9 pr-4 py-2 text-sm text-slate-50 font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll p-5" style={{ background: '#090b11' }}>
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Frown size={44} strokeWidth={2} />
            <p className="text-sm font-black uppercase">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
            {filteredUsers.map((user, idx) => (
              <div
                key={`${user.username}-${idx}`}
                className="flex items-center justify-between p-3 group cursor-pointer transition-all duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px] min-w-0"
                style={{
                  background: '#131824',
                  border: '2px solid #f8fafc',
                  boxShadow: '3px 3px 0 #000000',
                  borderRadius: '12px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#1e293b';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0 #000000';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#131824';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '3px 3px 0 #000000';
                }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <div
                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-xs font-black text-slate-50"
                    style={{
                      background: '#1e293b',
                      border: '2px solid #f8fafc',
                      boxShadow: '2px 2px 0 #000000',
                      borderRadius: '8px',
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold truncate text-slate-50">
                    @{user.username}
                  </span>
                </div>

                <button
                  onClick={() => openInstagram(user.username)}
                  className="neo-btn flex-shrink-0 ml-2 p-1.5 opacity-0 group-hover:opacity-100"
                  style={{ background: '#090b11' }}
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
