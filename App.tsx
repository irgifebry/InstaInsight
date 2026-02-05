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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dontFollowBack' | 'fans' | 'mutuals'>('dontFollowBack');

  // Reset
  const reset = () => {
    setStep('upload');
    setFollowingData([]);
    setFollowersData([]);
    setResult(null);
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
                Ganti Akun / Scan Ulang
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
                Ghosting di IG? No-Debat, Cek di Sini!
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Cara tersat-set buat kepoin follower lo tanpa drama password. Aman jaya!
              </p>
            </div>

            <SessionScanner onDataLoaded={(following, followers) => {
              // Process data from session scanner
              setFollowingData(following);
              setFollowersData(followers);

              // Run analysis immediately
              const analysis = analyzeData(following, followers);
              setResult(analysis);
              setStep('analysis');
            }} />
          </div>
        )}

        {step === 'analysis' && result && (
          <div className="animate-fade-in">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Gak Follback"
                count={result.dontFollowBack.length}
                icon={<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>}
                colorClass="text-red-500"
                isActive={activeTab === 'dontFollowBack'}
                onClick={() => setActiveTab('dontFollowBack')}
              />
              <StatsCard
                title="Cuma Follow Lo"
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
            </div>

            {/* Main List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                {activeTab === 'dontFollowBack' && (
                  <UserList
                    title="Yah, kena ghosting... Mereka nggak follback lo"
                    users={result.dontFollowBack}
                    color="text-red-400"
                  />
                )}
                {activeTab === 'fans' && (
                  <UserList
                    title="Fans Rahasia (Lo belum follback mereka)"
                    users={result.fans}
                    color="text-green-400"
                  />
                )}
                {activeTab === 'mutuals' && (
                  <UserList
                    title="Teman Mutual"
                    users={result.mutuals}
                    color="text-blue-400"
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