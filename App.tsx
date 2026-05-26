import React, { useState } from 'react';
import { UserX, UserCheck, Users, UserMinus, RefreshCw, Activity } from 'lucide-react';
import { InstagramUser, AnalysisResult } from './types';
import { analyzeData } from './utils/instagramParser';
import { StatsCard } from './components/StatsCard';
import { UserList } from './components/UserList';
import { SessionScanner } from './components/SessionScanner';

type TabKey = 'dontFollowBack' | 'fans' | 'mutuals' | 'lostFollowers';

const TABS: {
  key: TabKey;
  label: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: 'dontFollowBack',
    label: 'Not Following Back',
    title: 'Ghosted — they are not following you back',
    icon: <UserX size={20} color="#f8fafc" strokeWidth={2.5} />,
    color: '#fda4af',
  },
  {
    key: 'fans',
    label: 'Secret Fans',
    title: "Secret fans — you haven't followed them back",
    icon: <UserCheck size={20} color="#f8fafc" strokeWidth={2.5} />,
    color: '#fde047',
  },
  {
    key: 'mutuals',
    label: 'Mutual Friends',
    title: 'Mutual friends — following each other',
    icon: <Users size={20} color="#f8fafc" strokeWidth={2.5} />,
    color: '#86efac',
  },
  {
    key: 'lostFollowers',
    label: 'Recently Unfollowed',
    title: 'Recently unfollowed you since last scan',
    icon: <UserMinus size={20} color="#f8fafc" strokeWidth={2.5} />,
    color: '#d8b4fe',
  },
];

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'analysis'>('upload');
  const [followingData, setFollowingData] = useState<InstagramUser[]>([]);
  const [followersData, setFollowersData] = useState<InstagramUser[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dontFollowBack');
  const [previousScanDate, setPreviousScanDate] = useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('instainsight_last_scan');
    if (saved) {
      try {
        const { following, followers, date } = JSON.parse(saved);
        setFollowingData(following);
        setFollowersData(followers);
        setPreviousScanDate(date);
        const analysis = analyzeData(following, followers, followers);
        setResult(analysis);
        setStep('analysis');
      } catch (e) {
        console.error('Failed to load saved scan', e);
      }
    }
  }, []);

  const saveScan = (following: InstagramUser[], followers: InstagramUser[]) => {
    const data = { following, followers, date: new Date().toISOString() };
    localStorage.setItem('instainsight_last_scan', JSON.stringify(data));
    setPreviousScanDate(data.date);
  };

  const exportToCSV = (users: InstagramUser[], filename: string) => {
    const headers = ['Username', 'Profile Link', 'Scan Date'];
    const rows = users.map(u => [
      u.username,
      u.href || `https://instagram.com/${u.username}`,
      u.timestamp ? new Date(u.timestamp * 1000).toLocaleString() : 'N/A',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    if (confirm('Reset view? Saved scan data stays in storage until replaced.')) {
      setStep('upload');
      setFollowingData([]);
      setFollowersData([]);
      setResult(null);
    }
  };

  const activeTabConfig = TABS.find(t => t.key === activeTab)!;

  const getResultCount = (key: TabKey): number => {
    if (!result) return 0;
    if (key === 'lostFollowers') return result.lostFollowers?.length || 0;
    return result[key].length;
  };

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#090b11' }}>
      <nav
        className="sticky top-0 z-50"
        style={{
          background: '#131824',
          borderBottom: '2px solid #1e293b',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity size={20} color="#f8fafc" strokeWidth={2.5} />
              <span className="font-black text-slate-50 tracking-tight text-lg uppercase">
                InstaInsight
              </span>
            </div>

            {step === 'analysis' && (
              <button
                id="rescan-btn"
                onClick={reset}
                className="neo-btn flex items-center gap-1.5 text-xs font-black px-4 py-2 uppercase tracking-wide"
                style={{
                  background: '#090b11',
                  color: '#f8fafc',
                }}
              >
                <RefreshCw size={14} strokeWidth={2.5} />
                Rescan
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'upload' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="neo-badge inline-block text-xs font-black uppercase tracking-widest px-4 py-2 mb-6">
                No password needed
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 leading-none text-slate-50 uppercase">
                Know Your
                <br />
                <span style={{ background: '#1e293b', padding: '0 0.15em', border: '3px solid #f8fafc', boxShadow: '4px 4px 0 #000', display: 'inline-block', marginTop: '0.15em', borderRadius: '8px' }}>
                  Followers
                </span>
              </h1>
              <p className="text-base max-w-lg mx-auto leading-relaxed font-medium text-slate-300">
                Find who ghosted you, your secret fans, mutual friends, and recent unfollowers — all locally and privately.
              </p>
            </div>

            <SessionScanner
              onDataLoaded={(following, followers) => {
                setFollowingData(following);
                setFollowersData(followers);
                saveScan(following, followers);
                const analysis = analyzeData(following, followers, followersData);
                setResult(analysis);
                setStep('analysis');
              }}
            />
          </div>
        )}

        {step === 'analysis' && result && (
          <div className="animate-fade-in flex flex-col w-full">
            {previousScanDate && (
              <div
                className="inline-flex items-center gap-2 mb-6 text-xs font-bold px-3 py-1.5"
                style={{
                  background: '#131824',
                  border: '2px solid #f8fafc',
                  boxShadow: '2px 2px 0 #000',
                  color: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                <Activity size={12} strokeWidth={2.5} />
                Last scan: {new Date(previousScanDate).toLocaleString()}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {TABS.map(tab => (
                <StatsCard
                  key={tab.key}
                  title={tab.label}
                  count={getResultCount(tab.key)}
                  icon={tab.icon}
                  isActive={activeTab === tab.key}
                  activeBgColor={tab.color}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>

            <div
              className="overflow-hidden"
              style={{
                border: '3px solid #f8fafc',
                boxShadow: '6px 6px 0 #000000',
                background: '#131824',
                borderRadius: '16px',
              }}
            >


              <UserList
                title={activeTabConfig.title}
                users={
                  activeTab === 'dontFollowBack' ? result.dontFollowBack
                  : activeTab === 'fans' ? result.fans
                  : activeTab === 'mutuals' ? result.mutuals
                  : result.lostFollowers || []
                }
                onExport={() =>
                  exportToCSV(
                    activeTab === 'dontFollowBack' ? result.dontFollowBack
                    : activeTab === 'fans' ? result.fans
                    : activeTab === 'mutuals' ? result.mutuals
                    : result.lostFollowers || [],
                    activeTab
                  )
                }
              />
            </div>
          </div>
        )}
      </main>

      <footer
        className="mt-auto py-8"
        style={{
          background: '#131824',
          borderTop: '2px solid #1e293b',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
          <span className="font-black text-slate-50 tracking-tight text-sm uppercase">
            InstaInsight © 2026 — Created by Irgi Febry
          </span>
          <div className="flex gap-4">
            <a
              href="https://github.com/irgifebry"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center justify-center p-2.5 h-10 w-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/irgi.syh/"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center justify-center p-2.5 h-10 w-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@wymidk0"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center justify-center p-2.5 h-10 w-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
