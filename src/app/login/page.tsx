'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TreePine, Shield, Eye, EyeOff } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useI18n } from '@/lib/i18n/context';

export default function LoginPage() {
  const { login, verifyMfa, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [mfaCode, setMfaCode] = useState('');

  // If already authenticated (e.g. navigating to /login while logged in),
  // hard-redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requireMfa) {
        setStep('mfa');
      } else {
        // Login successful — hard redirect to dashboard
        // Using window.location.href instead of router.replace()
        // to ensure a full page reload that properly initializes all state
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await verifyMfa(mfaCode);
      if (success) {
        // MFA successful — hard redirect to dashboard
        window.location.href = '/';
      } else {
        setError('Invalid verification code');
      }
    } catch {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const { t } = useI18n();
  const demoAccounts = [
    { email: 'admin@terraforest.vn', role: t.users.systemAdmin },
    { email: 'ops@terraforest.vn', role: t.users.operationsManager },
    { email: 'lead@terraforest.vn', role: t.users.teamLead },
    { email: 'ranger@terraforest.vn', role: t.users.ranger },
    { email: 'auditor@terraforest.vn', role: t.users.auditor },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #071A0E 0%, #0D3320 40%, #14462C 70%, #1B5A38 100%)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full" height="300" viewBox="0 0 1440 300" fill="none">
          <path d="M0 300V200L60 160L120 200L180 140L240 180L300 120L360 160L420 100L480 140L540 80L600 120L660 60L720 100L780 40L840 80L900 20L960 60L1020 100L1080 40L1140 80L1200 120L1260 60L1320 100L1380 140L1440 100V300H0Z" fill="#071A0E" fillOpacity="0.6"/>
          <path d="M0 300V240L80 200L160 240L240 180L320 220L400 160L480 200L560 140L640 180L720 120L800 160L880 100L960 140L1040 180L1120 120L1200 160L1280 200L1360 140L1440 180V300H0Z" fill="#0D3320" fillOpacity="0.8"/>
        </svg>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: 4 + i * 2,
              height: 4 + i * 2,
              backgroundColor: `rgba(82, 183, 136, ${0.15 + i * 0.05})`,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-forest-500/20 backdrop-blur-sm border border-forest-400/30 flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-8 h-8 text-forest-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">Terra Forest</h1>
          <p className="text-forest-300 text-sm mt-1">{t.appTagline}</p>
        </div>

        <Card className="shadow-2xl border-0 glass">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">
              {step === 'credentials' ? t.login.signIn : t.login.twoFactor}
            </CardTitle>
            <CardDescription className="text-forest-300">
              {step === 'credentials'
                ? t.login.enterCredentials
                : t.login.enterVerificationCode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'credentials' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-forest-200">{t.users.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@terraforest.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-forest-600/50 text-white placeholder:text-forest-400 focus:border-forest-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-forest-200">{t.users.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-forest-600/50 text-white placeholder:text-forest-400 focus:border-forest-400 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <Button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white" disabled={loading}>
                  {loading ? t.login.signingIn : t.login.signIn}
                </Button>
                <div className="mt-3 p-3 rounded-lg bg-forest-800/40 border border-forest-600/20">
                  <p className="text-forest-300 text-[10px] font-semibold mb-2 uppercase tracking-wider">{t.login.demoAccounts}</p>
                  <div className="space-y-1">
                    {demoAccounts.map(a => (
                      <button
                        key={a.email}
                        type="button"
                        onClick={() => { setEmail(a.email); setPassword('password'); }}
                        className="w-full flex items-center justify-between text-left px-2 py-1 rounded hover:bg-forest-700/30 transition-colors"
                      >
                        <span className="text-forest-200 text-xs">{a.email}</span>
                        <span className="text-forest-400 text-[10px]">{a.role}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-forest-400 text-[10px] mt-2">{t.login.passwordForAll}: <code className="text-forest-200">password</code></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMfa} className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-forest-500/20 flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-forest-300" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <Button type="submit" className="w-full bg-forest-600 hover:bg-forest-700 text-white" disabled={loading || mfaCode.length < 6}>
                  {loading ? t.login.verifying : t.login.verify}
                </Button>
                <p className="text-forest-400 text-xs text-center">{t.login.demoMfaHint}</p>
                <button type="button" onClick={() => setStep('credentials')} className="w-full text-forest-300 text-xs hover:text-forest-100 transition-colors">
                  {t.login.backToSignIn}
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-forest-400/50 text-[10px] text-center mt-4">
          2025 Terra Forest — Vietnam Administration of Forestry, MARD
        </p>
      </div>
    </div>
  );
}
