'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Premium dark hero background */}
      <div className="absolute inset-0 bg-[#0D0D0D]">
        {/* Subtle gold gradient overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(32, 34%, 52%), transparent 70%)',
        }} />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(176,141,87,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          
          {/* Logo */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="animate-subtle-float">
              <GarageFolioLogo variant="gold" size="xl" showText={false} />
            </div>
            <div>
              <GarageFolioLogo variant="gold" size="lg" showText={true} />
            </div>
            <p className="text-white/40 text-sm tracking-wide">
              Garage Management System
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in-up delay-150">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">Sign In</h2>
              <p className="text-sm text-white/40">
                Enter your credentials to access your facility
              </p>
            </div>

            <div className="divider-gold" />

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-xs uppercase tracking-wider font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@garagefolio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/25 rounded-xl focus:border-gold-accent transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-xs uppercase tracking-wider font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/25 rounded-xl pr-12 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1 min-h-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-scale-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 btn-gold text-base font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="pt-2">
              <p className="text-xs text-white/25 text-center">
                Use your registered email and password to access the system
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-white/20 animate-fade-in delay-500">
            GarageFolio Enterprise © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
