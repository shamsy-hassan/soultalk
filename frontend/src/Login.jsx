import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe2,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BACKEND_BASE_URL } from './config';
import { getLanguages } from './api';
import {
  getLanguageFlag,
  getLanguageName,
  resolveUiLanguage,
  setUiLanguage,
} from './i18n';

const STEP_COUNT = 4;

const Login = ({ onLogin }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [goodbyeMessage, setGoodbyeMessage] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(resolveUiLanguage());
  const [languages, setLanguages] = useState([]);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  const stepLabels = [
    t('language', { defaultValue: 'Language' }),
    t('email', { defaultValue: 'Email' }),
    t('verification', { defaultValue: 'Verification' }),
    t('profile', { defaultValue: 'Profile' }),
  ];

  const languageOptions = useMemo(() => {
    const source = languages.length
      ? languages
      : [{ code: 'en' }, { code: 'sw' }, { code: 'fr' }, { code: 'ar' }];
    return source.slice(0, 12);
  }, [languages]);

  useEffect(() => {
    const logoutMessage = location.state?.goodbyeMessage;
    if (!logoutMessage) return undefined;
    setGoodbyeMessage(logoutMessage);
    const timer = setTimeout(() => setGoodbyeMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    let active = true;
    setLoadingLanguages(true);
    getLanguages({ uiOnly: true })
      .then((data) => {
        if (active) setLanguages(data.languages || []);
      })
      .catch(() => {
        if (active) setLanguages([]);
      })
      .finally(() => {
        if (active) setLoadingLanguages(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const showError = (error) => {
    setMessage(error || t('something_went_wrong', { defaultValue: 'Something went wrong. Please try again.' }));
  };

  const goToStep = (nextStep) => {
    setMessage('');
    setStep(Math.max(0, Math.min(nextStep, STEP_COUNT - 1)));
  };

  const handleEmailContinue = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setCheckingEmail(true);
    setMessage('');

    try {
      const checkResponse = await fetch(`${BACKEND_BASE_URL}/api/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const checkData = await checkResponse.json();
      if (!checkResponse.ok) {
        showError(checkData.error);
        return;
      }

      const registered = Boolean(checkData.registered);
      setIsRegistered(registered);
      setEmail(checkData.email || normalizedEmail);
      setUsername(checkData.username || '');

      setSendingOtp(true);
      const otpResponse = await fetch(`${BACKEND_BASE_URL}/api/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: checkData.email || normalizedEmail }),
      });
      const otpData = await otpResponse.json();
      if (!otpResponse.ok) {
        showError(otpData.error || otpData.details);
        return;
      }

      setMessage(otpData.message || '');
      setStep(2);
    } catch {
      showError(t('failed_to_check_number', { defaultValue: 'Failed to check email address.' }));
    } finally {
      setCheckingEmail(false);
      setSendingOtp(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        showError(data.error || data.details);
        return;
      }
      setMessage(data.message || t('otp_resent_message'));
    } catch {
      showError(t('failed_to_resend_otp'));
    } finally {
      setResending(false);
    }
  };

  const handleFinish = async () => {
    if (!otp || otp.length !== 6 || !selectedLanguage || (!isRegistered && (!email || !username))) {
      showError(t('complete_required_fields', { defaultValue: 'Complete all required fields to continue.' }));
      return;
    }

    setVerifying(true);
    setMessage('');
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          username,
          language: selectedLanguage,
          email,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showError(data.error);
        return;
      }

      localStorage.setItem('HeyBuddy_token', data.token);
      localStorage.setItem('HeyBuddy_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch {
      showError(t('failed_to_verify_otp'));
    } finally {
      setVerifying(false);
    }
  };

  const selectLanguage = async (code) => {
    setSelectedLanguage(code);
    await setUiLanguage(code);
  };

  const isBusy = checkingEmail || sendingOtp || verifying;

  return (
    <div className="fixed inset-0 overflow-hidden st-combo1-bg text-heybuddy-dark-gray">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-heybuddy-lavender/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-heybuddy-teal/15 blur-3xl" />

      {goodbyeMessage && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-gray-800/60 bg-gray-950/90 px-4 py-2 text-sm text-heybuddy-dark-gray shadow-xl">
            <CheckCircle2 className="h-4 w-4 text-heybuddy-teal" />
            {goodbyeMessage}
          </div>
        </div>
      )}

      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-5 sm:px-8 sm:py-7">
        <header className="relative z-20 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-heybuddy-gradient-start to-heybuddy-gradient-end shadow-lg">
              <MessageSquare className="h-5 w-5 text-white" />
              <Sparkles className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-gray-950 p-0.5 text-heybuddy-lavender" />
            </div>
            <div>
              <p className="font-bold sm:text-lg">HeyBuddy</p>
              <p className="hidden text-xs text-heybuddy-medium-gray sm:block">
                {t('spread_joy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-heybuddy-medium-gray sm:text-sm">
            <ShieldCheck className="h-4 w-4 text-heybuddy-teal" />
            <span className="hidden sm:inline">{t('secure_encrypted_communication')}</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </header>

        <div className="relative z-20 mx-auto mt-4 w-full max-w-2xl shrink-0 rounded-xl bg-transparent">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-heybuddy-medium-gray">
              {t('setup_your_account', { defaultValue: 'Set up your account' })}
            </span>
            <span className="text-sm font-semibold">
              {step + 1} <span className="text-heybuddy-medium-gray">/ {STEP_COUNT}</span>
            </span>
          </div>
          <div className="mb-2 grid grid-cols-4 gap-2">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => index < step && goToStep(index)}
                className={`flex min-w-0 flex-col items-center gap-1 text-center text-[10px] font-medium leading-tight transition-colors sm:text-left sm:text-[11px] ${
                  index <= step ? 'text-heybuddy-dark-gray' : 'text-heybuddy-medium-gray'
                }`}
              >
                <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  index < step
                    ? 'bg-heybuddy-teal text-white'
                    : index === step
                      ? 'bg-heybuddy-lavender text-white'
                      : 'bg-gray-950/30 text-heybuddy-medium-gray'
                }`}>
                  {index < step ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="max-w-full break-words">{label}</span>
              </button>
            ))}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-gray-950/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-heybuddy-gradient-start to-heybuddy-gradient-end transition-all duration-500"
              style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
            />
          </div>
        </div>

        <main className="relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden py-3 sm:py-5">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2rem]">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${step * 100}%)` }}
            >
              <section className="order-2 min-w-full">
                <div className="st-combo1-surface relative z-0 mx-auto rounded-[2rem] border border-gray-800/50 p-4 shadow-2xl sm:p-8">
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-heybuddy-teal/10 text-heybuddy-teal">
                      <Mail className="h-7 w-7" />
                    </div>
                    <h1 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
                      {t('email', { defaultValue: 'Enter your email address' })}
                    </h1>
                    <p className="mt-2 text-sm text-heybuddy-medium-gray">
                      {t('email_for_otp', { defaultValue: 'We will send a verification code to your email.' })}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <input
                      className="input-field w-full"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t('email_for_otp')}
                      autoComplete="email"
                      inputMode="email"
                      disabled={isBusy}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(0)}
                        className="st-combo1-outline flex-1"
                      >
                        <ArrowLeft className="mr-2 inline h-4 w-4" />
                        {t('back')}
                      </button>
                      <button
                        type="button"
                        onClick={handleEmailContinue}
                        disabled={isBusy || !email.trim()}
                        className="st-combo1-button flex-1"
                      >
                        {checkingEmail || sendingOtp ? t('processing') : t('continue')}
                        <ArrowRight className="ml-2 inline h-4 w-4" />
                      </button>
                    </div>
                    {message && (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="order-3 min-w-full">
                <div className="st-combo1-surface relative z-0 mx-auto rounded-[2rem] border border-gray-800/50 p-4 shadow-2xl sm:p-8">
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-heybuddy-lavender/10 text-heybuddy-lavender">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h2 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
                      {t('verify_email', { defaultValue: 'Verify your email' })}
                    </h2>
                    <p className="mt-2 text-sm text-heybuddy-medium-gray">
                      {t('enter_6_digit_code', { email })}
                    </p>
                  </div>
                  <input
                    className="input-field w-full text-center text-xl font-semibold tracking-[0.4em]"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={verifying}
                  />
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => goToStep(1)} className="st-combo1-outline flex-1">
                      <ArrowLeft className="mr-2 inline h-4 w-4" />
                      {t('back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      disabled={otp.length !== 6}
                      className="st-combo1-button flex-1"
                    >
                      {t('continue')} <ArrowRight className="ml-2 inline h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-4 w-full text-sm text-heybuddy-medium-gray underline underline-offset-4"
                  >
                    {resending ? t('resending') : t('resend_otp')}
                  </button>
                  {message && (
                    <p className="mt-3 rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-center text-sm text-heybuddy-dark-gray">
                      {message}
                    </p>
                  )}
                </div>
              </section>

              <section className="order-1 min-w-full">
                <div className="st-combo1-surface relative z-0 mx-auto rounded-[2rem] border border-gray-800/50 p-4 shadow-2xl sm:p-8">
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-heybuddy-lavender/10 text-heybuddy-lavender">
                      <Globe2 className="h-7 w-7" />
                    </div>
                    <h2 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
                      {t('choose_your_language')}
                    </h2>
                    <p className="mt-2 text-sm text-heybuddy-medium-gray">
                      {t('language_carousel_hint')}
                    </p>
                  </div>
                  {loadingLanguages ? (
                    <div className="py-8 text-center text-sm text-heybuddy-medium-gray">{t('processing')}</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {languageOptions.map((language) => {
                        const code = language.code || language;
                        const active = selectedLanguage === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => void selectLanguage(code)}
                            className={`flex min-w-0 items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                              active
                                ? 'border-heybuddy-teal bg-heybuddy-teal/10'
                                : 'border-gray-800/60 bg-gray-950/20 hover:border-heybuddy-teal/50'
                            }`}
                          >
                            <span className="shrink-0 text-xl">{getLanguageFlag(code)}</span>
                            <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-tight">
                              {getLanguageName(code)}
                            </span>
                            {active && <Check className="h-4 w-4 shrink-0 text-heybuddy-teal" />}
                          </button>
                        );
})}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => goToStep(1)} className="st-combo1-button flex-1">
                      {t('continue')} <ArrowRight className="ml-2 inline h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section className="order-4 min-w-full">
                <div className="st-combo1-surface relative z-0 mx-auto rounded-[2rem] border border-gray-800/50 p-4 shadow-2xl sm:p-8">
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-heybuddy-teal/10 text-heybuddy-teal">
                      <UserRound className="h-7 w-7" />
                    </div>
                    <h2 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
                      {t('complete_your_profile', { defaultValue: 'Complete your profile' })}
                    </h2>
                    <p className="mt-2 text-sm text-heybuddy-medium-gray">
                      {isRegistered
                        ? t('account_found', { defaultValue: 'Your account is ready to continue.' })
                        : t('details_help')}
                    </p>
                  </div>
                  {!isRegistered && (
                    <div className="space-y-3">
                      <label className="relative block">
                        <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-heybuddy-medium-gray" />
                        <input
                          className="input-field w-full pl-10"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder={t('email_for_otp')}
                          autoComplete="email"
                        />
                      </label>
                      <label className="relative block">
                        <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-heybuddy-medium-gray" />
                        <input
                          className="input-field w-full pl-10"
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          placeholder={t('username')}
                          autoComplete="username"
                        />
                      </label>
                    </div>
                  )}
                  {message && (
                    <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                      {message}
                    </p>
                  )}
                  <div className="mt-5 flex gap-3">
                    <button type="button" onClick={() => goToStep(2)} className="st-combo1-outline flex-1">
                      <ArrowLeft className="mr-2 inline h-4 w-4" /> {t('back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleFinish()}
                      disabled={verifying}
                      className="st-combo1-button flex-1"
                    >
                      {verifying ? t('verifying') : t('start_your_journey')}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <footer className="flex items-center justify-center gap-2 text-center text-xs text-heybuddy-medium-gray">
          <Mail className="h-3.5 w-3.5 text-heybuddy-teal" />
          <span>{t('email_for_otp', { defaultValue: 'Verification code sent securely by email.' })}</span>
        </footer>
      </div>
    </div>
  );
};

export default Login;
