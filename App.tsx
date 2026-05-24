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
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
}[] = [
  {
    key: 'dontFollowBack',
    label: 'Not Following Back',
    title: 'Ghosted — they are not following you back',
    icon: <UserX size={20} color="white" strokeWidth={2} />,
    gradientFrom: '#E1306C',
    gradientTo: '#C13584',
    accentColor: '#E1306C',
  },
  {
    key: 'fans',
    label: 'Secret Fans',
    title: "Secret fans — you haven't followed them back",
    icon: <UserCheck size={20} color="white" strokeWidth={2} />,
    gradientFrom: '#405DE6',
    gradientTo: '#5B51D8',
    accentColor: '#405DE6',
  },
  {
    key: 'mutuals',
    label: 'Mutual Friends',
    title: 'Mutual friends — following each other',
    icon: <Users size={20} color="white" strokeWidth={2} />,
    gradientFrom: '#FCAF45',
    gradientTo: '#F77737',
    accentColor: '#FCAF45',
  },
  {
    key: 'lostFollowers',
    label: 'Recently Unfollowed',
    title: 'Recently unfollowed you since last scan',
    icon: <UserMinus size={20} color="white" strokeWidth={2} />,
    gradientFrom: '#FD1D1D',
    gradientTo: '#F56040',
    accentColor: '#FD1D1D',
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
    <div className="min-h-screen font-sans" style={{ background: '#090b11' }}>
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: 'rgba(9,11,17,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #405DE6, #833AB4, #E1306C, #F77737, #FFDC80)' }}
              >
                <Activity size={16} color="white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-white tracking-tight text-lg">InstaInsight</span>
            </div>

            {step === 'analysis' && (
              <button
                id="rescan-btn"
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(248,250,252,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <RefreshCw size={12} strokeWidth={2.5} />
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
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(64,93,230,0.18)', color: '#405DE6', border: '1px solid rgba(64,93,230,0.3)' }}
              >
                No password needed
              </div>
              <h1
                className="text-5xl sm:text-6xl font-black tracking-tight mb-4 leading-none"
                style={{
                  background: 'linear-gradient(135deg, #405DE6, #833AB4, #E1306C, #F77737, #FFDC80)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Know Your<br />Followers
              </h1>
              <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>
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
          <div className="animate-fade-in">
            {previousScanDate && (
              <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: 'rgba(248,250,252,0.35)' }}>
                <Activity size={12} strokeWidth={2} />
                Last scan: {new Date(previousScanDate).toLocaleString()}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {TABS.map(tab => (
                <StatsCard
                  key={tab.key}
                  title={tab.label}
                  count={getResultCount(tab.key)}
                  icon={tab.icon}
                  gradientFrom={tab.gradientFrom}
                  gradientTo={tab.gradientTo}
                  isActive={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex gap-0 overflow-x-auto"
                style={{ background: 'rgba(19,24,36,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    id={`tab-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-all relative"
                    style={{
                      color: activeTab === tab.key ? tab.accentColor : 'rgba(248,250,252,0.4)',
                      background: 'transparent',
                    }}
                  >
                    {tab.label}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-black"
                      style={{
                        background: activeTab === tab.key ? `${tab.accentColor}22` : 'rgba(255,255,255,0.06)',
                        color: activeTab === tab.key ? tab.accentColor : 'rgba(248,250,252,0.3)',
                      }}
                    >
                      {getResultCount(tab.key)}
                    </span>
                    {activeTab === tab.key && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: tab.accentColor }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <UserList
                title={activeTabConfig.title}
                users={
                  activeTab === 'dontFollowBack' ? result.dontFollowBack
                  : activeTab === 'fans' ? result.fans
                  : activeTab === 'mutuals' ? result.mutuals
                  : result.lostFollowers || []
                }
                accentColor={activeTabConfig.accentColor}
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
    </div>
  );
};

export default App;