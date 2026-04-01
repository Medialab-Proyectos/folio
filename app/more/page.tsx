'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Building2,
  Settings,
  LogOut,
  Shield,
  Wrench,
  KeyRound,
  Eye,
  EyeOff,
  ChevronRight,
  Loader2,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';

export default function MorePage() {
  const router = useRouter();
  const { currentUser, logout, store, showToast } = useApp();

  // ─── Change password state ────────────────────────────────────────────────
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirm: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (!currentUser) router.push('/');
  }, [currentUser, router]);

  if (!currentUser) return null;

  const facility = store.facilities.find(f => f.id === currentUser.facilityId);
  const isSuperUser = currentUser.role === 'super_user';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');

    if (pwdForm.newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdError('Passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await authApi.changePassword({ password: pwdForm.newPassword });
      showToast('Password changed successfully', 'success');
      setShowChangePwd(false);
      setPwdForm({ newPassword: '', confirm: '' });
    } catch (err: any) {
      setPwdError(err?.message || 'Failed to change password. Please try again.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Header */}
      <div className="header-gradient border-b border-border/60">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">More</h1>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* User Profile */}
        <div className="card-premium p-5 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/80 to-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                {currentUser.firstName === 'string' ? "Ing. John" : currentUser.firstName} {currentUser.lastName === 'string' ? "Chapid" : currentUser.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {isSuperUser && (
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent/10 text-accent border border-accent/20">
                    Super User
                  </span>
                )}
                <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-success/10 text-success border border-success/20">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Facility Info */}
        <div className="space-y-2 animate-fade-in-up delay-75">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Facility
          </h3>
          <div className="card-premium p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold">{facility?.name === 'string' ? 'Main Garage Facility' : (facility?.name || '—')}</p>
                <p className="text-sm text-muted-foreground">{facility?.address === 'string' ? '123 Garage Ave, NY 10001' : (facility?.address || '—')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="space-y-2 animate-fade-in-up delay-150">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Account
          </h3>

          <div className="card-premium divide-y divide-border/50 overflow-hidden">
            {/* Change Password */}
            <button
              onClick={() => { setShowChangePwd(v => !v); setPwdError(''); }}
              className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors w-full text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-transform ${showChangePwd ? 'rotate-90' : ''}`} />
            </button>

            {/* Inline change-password form */}
            {showChangePwd && (
              <div className="p-4 bg-muted/20 animate-scale-in">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNew ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={pwdForm.newPassword}
                        onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="pr-10 h-12 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-0 p-1"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat new password"
                        value={pwdForm.confirm}
                        onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                        className="pr-10 h-12 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-0 p-1"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {pwdError && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-xl border border-destructive/20 animate-scale-in">
                      {pwdError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl h-11"
                      onClick={() => { setShowChangePwd(false); setPwdForm({ newPassword: '', confirm: '' }); }}
                      disabled={pwdLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 btn-dark rounded-xl h-11" disabled={pwdLoading}>
                      {pwdLoading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span>
                      ) : 'Save Password'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {isSuperUser && (
              <Link href="/more/admin" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Admin Console</p>
                  <p className="text-xs text-muted-foreground">Manage roles and permissions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
              </Link>
            )}

            {/* App Settings — locked, not yet available */}
            <div className="flex items-center gap-3 p-4 opacity-50 cursor-not-allowed select-none">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-muted-foreground">App Settings</p>
                <p className="text-xs text-muted-foreground/70">Not available in this version</p>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </div>
        </div>

        {/* Developer Tools (Super User only) */}
        {isSuperUser && (
          <div className="space-y-2 animate-fade-in-up delay-200">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Developer Tools
            </h3>
            <Link href="/more/debug">
              <div className="card-premium p-4 group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Debug Panel</p>
                    <p className="text-xs text-muted-foreground">Testing & simulation tools</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-13 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 hover:border-destructive/40 rounded-xl font-semibold transition-all animate-fade-in-up delay-300"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>

        <div className="text-center pt-4 pb-2 animate-fade-in delay-500">
          <div className="flex justify-center mb-2">
            <GarageFolioLogo variant="dark" size="sm" showText={true} />
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-2">v1.0.0 • © {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
