import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Activity, Briefcase, FileText, Settings, Users, 
  Search, Bell, User, LayoutDashboard, CopyPlus, EyeOff 
} from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const location = useLocation();
  const [blindScreening, setBlindScreening] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Upload', path: '/upload', icon: FileText },
    { name: 'Compare', path: '/compare', icon: CopyPlus },
  ];

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              TalentLens AI
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-textMuted hover:text-textMain"
                )}
              >
                <item.icon size={18} className={isActive ? "text-primary" : "text-textMuted"} /> 
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5 space-y-2">
          {/* Blind Screening Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface/50 border border-white/5">
            <div className="flex items-center gap-2 text-sm text-textMuted">
              <EyeOff size={16} />
              <span>Blind Screening</span>
            </div>
            <button 
              onClick={() => setBlindScreening(!blindScreening)}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                blindScreening ? "bg-accent" : "bg-white/10"
              )}
            >
              <span 
                className={clsx(
                  "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                  blindScreening ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
          
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium text-textMuted w-full">
            <Settings size={18} /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none z-0" />
        
        {/* Top Header */}
        <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            {/* Job Selector Context */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface/50 rounded-lg border border-white/10">
              <Briefcase size={14} className="text-textMuted" />
              <select className="bg-transparent text-sm font-medium focus:outline-none text-textMain appearance-none pr-4 cursor-pointer">
                <option>Backend Software Engineer</option>
                <option>Senior Data Scientist</option>
                <option>Frontend Developer</option>
              </select>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
              <input 
                type="text" 
                placeholder="Search candidates, skills, or jobs..." 
                className="w-full bg-surface/50 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-textMuted/70"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <button className="relative p-2 text-textMuted hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 z-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
