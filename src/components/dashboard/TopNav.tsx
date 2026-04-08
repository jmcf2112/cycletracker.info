import { Moon, Globe, Bell, Calendar, Activity, BarChart2, Settings as SettingsIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function TopNav({ activeTab, onTabSelect }: { activeTab: string, onTabSelect: (val: string) => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4 mr-2" /> },
    { id: 'health', label: 'Health', icon: <Activity className="w-4 h-4 mr-2" /> },
    { id: 'insights', label: 'Insights', icon: <BarChart2 className="w-4 h-4 mr-2" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4 mr-2" /> }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex flex-col w-full mb-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Cycle Tracker</h1>
        </div>
        
        <div className="flex items-center justify-end gap-5 text-sm font-medium text-muted-foreground">
          <button onClick={() => navigate('/support')} className="hover:text-primary transition-colors flex items-center gap-2" aria-label="Open donation page">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
            Donate
          </button>
          <button className="hover:text-primary transition-colors"><Globe className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors"><Moon className="w-5 h-5" /></button>
          <button onClick={() => navigate('/profile')} className="hover:text-primary transition-colors flex items-center gap-2" aria-label="View profile">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline truncate max-w-[120px]">{user?.email}</span>
          </button>
          <button onClick={handleSignOut} className="hover:text-primary transition-colors flex items-center gap-2" aria-label="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
          <button className="hover:text-primary transition-colors bg-accent/10 p-2 rounded-full"><Bell className="w-4 h-4" /></button>
        </div>
      </header>

      <nav className="flex flex-wrap items-center gap-2 mt-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`flex items-center text-sm font-medium py-2 px-5 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
