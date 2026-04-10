'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import { AuthBackground, AuthCard } from '@/components/shared/auth-background';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    // Navigate to OTP code entry
    router.push(`/forgot-password/code?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthBackground>
      <AuthCard>
        {/* Logo */}
        <GarageFolioLogo variant="gold" size="lg" showText={true} />

        {/* Header with back button */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded hover:bg-[#f5f5f5] transition-colors min-h-0 p-0 flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
            </button>
            <h1 className="font-nunito font-semibold text-xl sm:text-2xl text-[#1a1a1a]">
              Enter your email
            </h1>
          </div>
          <p className="font-nunito text-sm sm:text-base text-[#727272]">
            Please provide your email address so we can send you the next steps to change your password.
          </p>
        </div>

        {/* Email Input */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 sm:gap-8">
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

          {/* Buttons */}
          <div className="w-full flex flex-col gap-4">
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
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full h-[46px] rounded-xl flex items-center justify-center font-nunito font-semibold text-base text-[#8d6941] border-2 border-[#a5824d] hover:bg-[#a5824d]/5 transition-all active:scale-[0.97] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
