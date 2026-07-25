import React, { useState } from 'react';
import { Lock, Mail, User, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { loginApi, registerApi, getMeApi } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('RESEARCH_SCIENTIST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await registerApi({ email, password, full_name: fullName, role });
      }
      const tokenRes = await loginApi(email, password);
      // Save temp token for getMe call
      localStorage.setItem('pharmagen_access_token', tokenRes.access_token);
      localStorage.setItem('pharmagen_refresh_token', tokenRes.refresh_token);

      const userRes = await getMeApi();
      setAuth(userRes, tokenRes.access_token, tokenRes.refresh_token);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-cyan-950">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            {isRegister ? 'Create PharmaGen Account' : 'Enterprise Sign In'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Register your research scientist credentials' : 'Authenticate with your corporate credentials'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs text-slate-400 font-medium">Full Name</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Eleanor Vance"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium">Corporate Email</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@pfizer.com"
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={8}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs text-slate-400 font-medium">Requested System Role</label>
              <div className="relative mt-1">
                <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="RESEARCH_SCIENTIST">Research Scientist</option>
                  <option value="LEAD_RESEARCHER">Lead Researcher</option>
                  <option value="AUDITOR">Auditor (Read-Only)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-950"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
