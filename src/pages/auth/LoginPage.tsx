import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, KeyRound, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { INITIAL_USERS } from '../../repositories/mock/mockData';
import { getRoleLabel } from '../../utils/permissions';
import { isSupabaseConfigured } from '../../services/supabase/client';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('admin@ninoluxuryhotel.ng');
  const [password, setPassword] = useState('HotelOS2026!');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please verify your staff login details.');
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setError('');
    setEmail(userEmail);
    const success = await login(userEmail, 'HotelOS2026!');
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-lg">
            <Hotel className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Nino Luxury Hotel</h1>
          <p className="text-xs text-neutral-400">
            Kubwa, Abuja, Nigeria • Hotel Management Operating System
          </p>
        </div>

        {/* Login form box */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h2 className="text-base font-semibold text-neutral-200">Staff Authentication</h2>
            <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
              {isSupabaseConfigured() ? '● Supabase Auth' : '● Local Auth'}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              prefixElement={<Mail className="w-4 h-4" />}
              placeholder="e.g. reception@ninoluxuryhotel.ng"
            />

            <Input
              label="Password / Access Token"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              prefixElement={<Lock className="w-4 h-4" />}
              placeholder="••••••••••••"
            />

            <Button
              type="submit"
              variant="gold"
              className="w-full h-11 text-neutral-950 font-semibold mt-2"
              isLoading={isLoading}
            >
              Sign In to Nino Luxury Hotel
            </Button>
          </form>

          {/* Quick Staff Presets */}
          <div className="pt-4 border-t border-neutral-800 space-y-2.5">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider text-center">
              Quick Role Switch for Review & Testing
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INITIAL_USERS.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  className="flex flex-col items-start p-2 text-left rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 hover:border-amber-500/40 transition-colors text-xs cursor-pointer"
                >
                  <span className="font-semibold text-neutral-200 truncate w-full">{u.fullName}</span>
                  <span className="text-[10px] text-amber-500/90 truncate w-full">
                    {getRoleLabel(u.role)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500">
          Nino Luxury Hotel © 2026. Kubwa Expressway, Abuja, Nigeria.
        </p>
      </div>
    </div>
  );
};
