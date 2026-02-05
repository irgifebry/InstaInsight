import React, { useState, useMemo } from 'react';
import { InstagramUser } from '../types';

interface UserListProps {
  users: InstagramUser[];
  title: string;
  color: string; // e.g., 'text-red-500'
}

export const UserList: React.FC<UserListProps> = ({ users, title, color }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const openInstagram = (username: string) => {
    window.open(`https://instagram.com/${username}`, '_blank');
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className={`text-xl font-bold ${color}`}>
            {title} <span className="text-slate-500 text-sm font-normal">({users.length})</span>
          </h2>
          <input
            type="text"
            placeholder="Cari username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Tidak ada user ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredUsers.map((user, idx) => (
              <div 
                key={`${user.username}-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600 p-[2px]">
                    <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-300">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-sm font-medium truncate text-slate-200 group-hover:text-white">
                    {user.username}
                  </span>
                </div>
                
                <button
                  onClick={() => openInstagram(user.username)}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-900 bg-blue-900/20 hover:bg-blue-900/40 transition-all opacity-0 group-hover:opacity-100"
                >
                  Visit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};