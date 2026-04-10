'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import { AuthBackground, AuthCard } from '@/components/shared/auth-background';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = email.length > 0 && password.length > 0;

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
    <AuthBackground>
      <AuthCard>
        {/* Logo */}
        <GarageFolioLogo variant="gold" size="lg" showText={true} />

        {/* Header */}
        <div className="w-full flex flex-col gap-2">
          <h1 className="font-nunito font-semibold text-xl sm:text-2xl text-[#1a1a1a]">
            Log In
          </h1>
          <p className="font-nunito text-sm sm:text-base text-[#727272]">
            Enter your credentials to access your facility.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          {/* Email */}
          <div className="flex flex-col gap-0.5">
            <label className="flex items-center gap-1">
              <span className="font-nunito text-xs text-[#272727]">Email</span>
              <span className="text-[#c83a3a] text-sm">*</span>
            </label>
            <input
              type="email"
              placeholder="Example@garagefolio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-4 bg-[#fdfdfd] border border-[#f5f5f5] rounded-full text-base font-nunito text-[#1a1a1a] placeholder:text-[#727272] focus:outline-none focus:border-[#a5824d] focus:ring-2 focus:ring-[#a5824d]/15 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 items-end">
            <div className="w-full flex flex-col gap-0.5">
              <label className="flex items-center gap-1">
                <span className="font-nunito text-xs text-[#272727]">Password</span>
                <span className="text-[#c83a3a] text-sm">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 px-4 pr-10 bg-[#fdfdfd] border border-[#f5f5f5] rounded-full text-base font-nunito text-[#1a1a1a] placeholder:text-[#727272] focus:outline-none focus:border-[#a5824d] focus:ring-2 focus:ring-[#a5824d]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-[#1a1a1a] transition-colors min-h-0 p-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="font-nunito font-semibold text-xs text-[#8d6941] hover:text-[#6b5132] transition-colors px-2 py-1 min-h-0"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-[#c83a3a] bg-[#c83a3a]/10 border border-[#c83a3a]/20 p-3 rounded-xl animate-scale-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-nunito">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full h-[46px] rounded-xl flex items-center justify-center gap-3 font-nunito font-semibold text-base transition-all active:scale-[0.97] ${
              isFormValid && !loading
                ? 'bg-[#b4955c] text-[#1a1a1a] hover:bg-[#a5824d] shadow-md hover:shadow-lg cursor-pointer'
                : 'bg-[#e6e6e6] text-[#a3a3a3] cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Log In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
