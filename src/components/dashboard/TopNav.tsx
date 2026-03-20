import { Flower2, Moon, Sun, Globe, Bell, User } from 'lucide-react';
import { Button } from '../ui/button';

export function TopNav({ activeTab, onTabSelect }: { activeTab: string, onTabSelect: (val: string) => void }) {
  const tabs = ['Calendar', 'Health', 'Insights', 'Settings'];

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex flex-col w-full mb-6">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Flower2 className="w-6 h-6 text-primary" />
          <h1 className="font-serif text-xl font-semibold">Cycle Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Globe className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}><Moon className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white">Sign In</Button>
          <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="sm:hidden"><User className="w-4 h-4" /></Button>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-6 flex items-start sm:items-center gap-3">
        <span className="font-semibold shrink-0 transition-opacity">Using Guest Mode.</span>
        <span className="opacity-90 leading-snug text-xs sm:text-sm">Your data is stored locally. Sign in to sync across devices.</span>
      </div>

      <nav className="flex items-center gap-1 bg-muted/50 p-1.5 rounded-2xl overflow-x-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabSelect(tab.toLowerCase())}
            className={`flex-1 min-w-[80px] text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200 ${
              activeTab === tab.toLowerCase()
                ? 'bg-background shadow-sm text-primary scale-100 ring-1 ring-border shadow-card hover:bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
