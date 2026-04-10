'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import { AuthBackground, AuthCard } from '@/components/shared/auth-background';

function OTPCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isFormValid = code.every((digit) => digit.length === 1);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const focusIndex = Math.min(pasted.length, 4);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API verification
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${code.join('')}`);
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
              Insert the OTP Code
            </h1>
          </div>
          <p className="font-nunito text-sm sm:text-base text-[#727272]">
            Please provide the code sent to your email address so you can change your password.
          </p>
        </div>

        {/* OTP Code Input */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1">
              <span className="font-nunito text-xs text-[#272727]">OTP Code</span>
              <span className="text-[#c83a3a] text-sm">*</span>
            </label>
            <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="flex-1 aspect-square max-h-[53px] bg-[#fdfdfd] border border-[#f5f5f5] rounded-2xl text-center text-lg sm:text-xl font-nunito font-semibold text-[#1a1a1a] placeholder:text-[#727272] focus:outline-none focus:border-[#a5824d] focus:ring-2 focus:ring-[#a5824d]/15 transition-all"
                />
              ))}
            </div>
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

export default function OTPCodePage() {
  return (
    <Suspense>
      <OTPCodeContent />
    </Suspense>
  );
}
