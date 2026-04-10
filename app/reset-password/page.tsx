'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';
import { AuthBackground, AuthCard } from '@/components/shared/auth-background';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && newPassword.length >= 8;
  const isFormValid = isPasswordValid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  const handleGoToLogin = () => {
    router.push('/');
  };

  return (
    <AuthBackground>
      {/* Success Popup Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fade-in">
          <div className="w-full max-w-[345px] bg-white rounded-xl shadow-[0px_0px_20px_4px_rgba(0,0,0,0.15)] px-5 py-8 sm:px-6 sm:py-10 flex flex-col items-center gap-5 sm:gap-6 animate-scale-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#b4955c]/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#b4955c]" />
            </div>
            <div className="text-center flex flex-col gap-2">
              <h2 className="font-nunito font-semibold text-xl sm:text-2xl text-[#1a1a1a]">
                Password changed!
              </h2>
              <p className="font-nunito text-sm sm:text-base text-[#727272]">
                Your password has been changed successfully. You can now log in with your new password.
              </p>
            </div>
            <button
              onClick={handleGoToLogin}
              className="w-full h-[46px] rounded-xl flex items-center justify-center gap-3 font-nunito font-semibold text-base bg-[#b4955c] text-[#1a1a1a] hover:bg-[#a5824d] shadow-md hover:shadow-lg transition-all active:scale-[0.97] cursor-pointer"
            >
              Go to Log In
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <AuthCard>
        {/* Logo */}
        <GarageFolioLogo variant="gold" size="lg" showText={true} />

        {/* Header */}
        <div className="w-full flex flex-col gap-2">
          <h1 className="font-nunito font-semibold text-xl sm:text-2xl text-[#1a1a1a]">
            Change your password
          </h1>
          <p className="font-nunito text-sm sm:text-base text-[#727272]">
            For your security, please change your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {/* New Password */}
          <div className="flex flex-col gap-0.5">
            <label className="flex items-center gap-1">
              <span className="font-nunito text-xs text-[#272727]">New password</span>
              <span className="text-[#c83a3a] text-sm">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full h-11 px-4 pr-10 bg-[#fdfdfd] border border-[#f5f5f5] rounded-full text-base font-nunito text-[#1a1a1a] placeholder:text-[#727272] focus:outline-none focus:border-[#a5824d] focus:ring-2 focus:ring-[#a5824d]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-[#1a1a1a] transition-colors min-h-0 p-0"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-0.5">
            <label className="flex items-center gap-1">
              <span className="font-nunito text-xs text-[#272727]">Confirm password</span>
              <span className="text-[#c83a3a] text-sm">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-11 px-4 pr-10 bg-[#fdfdfd] border border-[#f5f5f5] rounded-full text-base font-nunito text-[#1a1a1a] placeholder:text-[#727272] focus:outline-none focus:border-[#a5824d] focus:ring-2 focus:ring-[#a5824d]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-[#1a1a1a] transition-colors min-h-0 p-0"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password requirements hint */}
            <div className="flex items-start gap-1.5 mt-1">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3a3a3] mt-0.5 flex-shrink-0" />
              <p className="font-nunito text-[11px] sm:text-xs text-[#a3a3a3] leading-tight">
                Make sure the password has at least one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full flex flex-col gap-4 mt-3 sm:mt-4">
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
                  Change password
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
