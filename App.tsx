import React, { useState } from 'react';
import { InstagramUser, AnalysisResult } from './types';
import { analyzeData } from './utils/instagramParser';
import { StatsCard } from './components/StatsCard';
import { UserList } from './components/UserList';
import { SessionScanner } from './components/SessionScanner';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'analysis'>('upload');

  const [followingData, setFollowingData] = useState<InstagramUser[]>([]);
  const [followersData, setFollowersData] = useState<InstagramUser[]>([]);
  const [previousFollowersData, setPreviousFollowersData] = useState<InstagramUser[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dontFollowBack' | 'fans' | 'mutuals' | 'lostFollowers'>('dontFollowBack');
  const [previousScanDate, setPreviousScanDate] = useState<string | null>(null);

  // Load from persistence
  React.useEffect(() => {
    const saved = localStorage.getItem('instainsight_last_scan');
    if (saved) {
      try {
        const { following, followers, date } = JSON.parse(saved);
        setFollowingData(following);
        setFollowersData(followers);
        setPreviousFollowersData(followers);
        setPreviousScanDate(date);
        const analysis = analyzeData(following, followers, followers);
        setResult(analysis);
        setStep('analysis');
      } catch (e) {
        console.error("Failed to load saved scan", e);
      }
    }
  }, []);

  // Save to persistence
  const saveScan = (following: InstagramUser[], followers: InstagramUser[]) => {
    setPreviousFollowersData(followersData);

    const data = {
      following,
      followers,
      date: new Date().toISOString()
    };
    localStorage.setItem('instainsight_last_scan', JSON.stringify(data));
    setPreviousScanDate(data.date);
  };

  // CSV Export Helper
  const exportToCSV = (users: InstagramUser[], filename: string) => {
    const headers = ['Username', 'Profile Link', 'Scan Date'];
    const rows = users.map(u => [
      u.username,
      u.href || `https://instagram.com/${u.username}`,
      u.timestamp ? new Date(u.timestamp * 1000).toLocaleString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
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

  // Reset
  const reset = () => {
    if (confirm("Are you sure? This will clear the current analysis view. (Saved data will stay in storage until replaced)")) {
      setStep('upload');
      setFollowingData([]);
      setFollowersData([]);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans selection:bg-pink-500 selection:text-white">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg instagram-gradient flex items-center justify-center text-white font-bold text-lg">
                I
              </div>
              <span className="font-bold text-xl tracking-tight text-white">InstaInsight</span>
            </div>
            {step === 'analysis' && (
              <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition-colors">
                Change Account / Rescan
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {step === 'upload' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                Ghosted on IG? No-Debate, Check Here!
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                The fastest way to check your followers without password drama. Stay safe!
              </p>
            </div>

            <SessionScanner onDataLoaded={(following, followers) => {
              // following/followers are the NEW results
              // followersData is the PREVIOUS result from state
              setFollowingData(following);
              setFollowersData(followers);
              saveScan(following, followers);

              const analysis = analyzeData(following, followers, followersData);
              setResult(analysis);
              setStep('analysis');
            }} />
          </div>
        )}

        {step === 'analysis' && result && (
          <div className="animate-fade-in">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Not Following Back"
                count={result.dontFollowBack.length}
                icon={<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>}
                colorClass="text-red-500"
                isActive={activeTab === 'dontFollowBack'}
                onClick={() => setActiveTab('dontFollowBack')}
              />
              <StatsCard
                title="Only Following You"
                count={result.fans.length}
                icon={<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                colorClass="text-green-500"
                isActive={activeTab === 'fans'}
                onClick={() => setActiveTab('fans')}
              />
              <StatsCard
                title="Mutual Friends"
                count={result.mutuals.length}
                icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                colorClass="text-blue-500"
                isActive={activeTab === 'mutuals'}
                onClick={() => setActiveTab('mutuals')}
              />
              <StatsCard
                title="Recently Unfollowed"
                count={result.lostFollowers?.length || 0}
                icon={<svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12h-6m6 0l-3-3m3 3l-3 3" /></svg>}
                colorClass="text-orange-500"
                isActive={activeTab === 'lostFollowers'}
                onClick={() => setActiveTab('lostFollowers')}
              />
            </div>

            {previousScanDate && (
              <div className="text-center mb-6 text-xs text-slate-500 animate-fade-in">
                Last scan performed on: <span className="text-slate-400 font-medium">{new Date(previousScanDate).toLocaleString()}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                {activeTab === 'dontFollowBack' && (
                  <UserList
                    title="Sad, ghosted... They are not following you back"
                    users={result.dontFollowBack}
                    color="text-red-400"
                    onExport={() => exportToCSV(result.dontFollowBack, 'not_following_back')}
                  />
                )}
                {activeTab === 'fans' && (
                  <UserList
                    title="Secret Fans (You haven't followed them back)"
                    users={result.fans}
                    color="text-green-400"
                    onExport={() => exportToCSV(result.fans, 'fans')}
                  />
                )}
                {activeTab === 'mutuals' && (
                  <UserList
                    title="Mutual Friends"
                    users={result.mutuals}
                    color="text-blue-400"
                    onExport={() => exportToCSV(result.mutuals, 'mutual_friends')}
                  />
                )}
                {activeTab === 'lostFollowers' && (
                  <UserList
                    title="Whoops! These users recently unfollowed you"
                    users={result.lostFollowers || []}
                    color="text-orange-400"
                    onExport={() => exportToCSV(result.lostFollowers || [], 'recently_unfollowed')}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;