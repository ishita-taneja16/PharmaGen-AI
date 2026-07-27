import React from 'react';
import { Dna, ShieldCheck, Bell, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { user: fallbackUser } = useStore();
  const { user: authUser, logout } = useAuthStore();

  const user = authUser || fallbackUser;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
          <Dna className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
            PharmaGen AI
          </h1>
          <p className="text-xs text-slate-400 font-medium">Intelligent Pharmaceutical R&D Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>21 CFR Part 11 Validated</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-semibold text-sm">
            {user?.full_name?.charAt(0) || 'D'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-200">{user?.full_name}</p>
            <p className="text-[11px] text-cyan-400 font-mono tracking-tight">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
