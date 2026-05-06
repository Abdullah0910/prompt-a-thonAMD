import { Layout, Utensils, Target, User as UserIcon, LogOut, Sparkles, Mic } from 'lucide-react';
import { UserData } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: UserData;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'meals', label: 'Nutrition', icon: Utensils },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Top Header as per design */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-neutral-900 bg-neutral-950 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-neutral-950" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-100">NutriMind <span className="text-emerald-400 font-light">AI</span></h1>
            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest leading-none">Intelligence Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Gemini Pro connected</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-neutral-800 p-0.5">
            <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center text-stone-900 font-bold text-xs uppercase">
              {user.displayName?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation as per design */}
      <footer className="fixed bottom-8 left-0 right-0 flex justify-center z-50 px-4">
        <nav className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-full px-4 py-2 flex items-center gap-1 shadow-2xl">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-neutral-100 text-neutral-950' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className={activeTab === item.id ? 'block' : 'hidden md:block'}>{item.label}</span>
            </button>
          ))}
          <div className="w-px h-6 bg-neutral-800 mx-2 hidden md:block"></div>
          <button className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-100 transition-colors hidden md:flex">
            <Mic className="w-5 h-5" />
          </button>
        </nav>
      </footer>
    </>
  );
}
