import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default function LoadingSplash({ onDone }) {
  const { t } = useTranslation();
  const prefersReducedMotion = getPrefersReducedMotion();
  // Total splash time: 5s (2.5s per phase).
  const totalMs = 5000;
  const phaseMs = totalMs / 2;
  const firstMs = phaseMs;
  const gapMs = 0;
  const secondMs = phaseMs;
  const fadeOutMs = prefersReducedMotion ? 0 : 150;

  const [phase, setPhase] = useState('first'); // first | second | done
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onDoneRef = useRef(onDone);
  const timersRef = useRef([]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Run once per mount (so it only shows on refresh/page load).

    const timers = [];
    timers.push(
      setTimeout(() => setPhase('second'), firstMs + gapMs)
    );
    if (fadeOutMs > 0) {
      timers.push(
        setTimeout(
          () => setIsFadingOut(true),
          Math.max(0, firstMs + gapMs + secondMs - fadeOutMs)
        )
      );
    }
    timers.push(
      setTimeout(() => {
        setPhase('done');
        onDoneRef.current?.();
      }, firstMs + gapMs + secondMs)
    );
    timersRef.current = timers;

    return () => {
      for (const timer of timersRef.current) clearTimeout(timer);
      timersRef.current = [];
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={[
        'st-splash fixed inset-0 z-[9999] flex items-center justify-center',
        'px-6 safe-pt safe-pb safe-px',
        isFadingOut ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      aria-hidden="true"
    >
      <div className="st-splash-bg absolute inset-0" />

      <div className="relative w-full max-w-md">
        <div
          className={[
            'absolute inset-0 flex flex-col items-center justify-center',
            'transition-opacity duration-300',
            phase === 'first' ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}
        >
          <div className="st-heartbeat mb-5 rounded-3xl bg-heybuddy-warm-gray/70 px-7 py-7 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] backdrop-blur">
            <Heart className="h-12 w-12 text-heybuddy-lavender" fill="currentColor" />
          </div>
          <div className="text-center">
	            <div className="text-2xl font-extrabold tracking-tight text-heybuddy-dark-gray">
	              {t('HeyBuddy_title')}
	            </div>
            <div className="mt-1 text-sm text-heybuddy-dark-gray/70">
              {t('connecting_hearts_across_languages')}
            </div>
          </div>

          <div className="pointer-events-none absolute -top-6 left-8 st-float-1">
            <Heart className="h-5 w-5 text-heybuddy-gradient-end/70" fill="currentColor" />
          </div>
          <div className="pointer-events-none absolute top-10 right-10 st-float-2">
            <Heart className="h-4 w-4 text-heybuddy-lavender/70" fill="currentColor" />
          </div>
          <div className="pointer-events-none absolute -bottom-6 right-14 st-float-3">
            <Heart className="h-6 w-6 text-heybuddy-gradient-start/60" fill="currentColor" />
          </div>
        </div>

        <div
          className={[
            'absolute inset-0 flex flex-col items-center justify-center',
            'transition-opacity duration-300',
            phase === 'second' ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}
        >
          <div className="mb-4 st-love-orbit relative">
            <div className="st-love-core rounded-3xl bg-heybuddy-warm-gray/70 px-8 py-8 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] backdrop-blur">
              <Heart className="h-12 w-12 text-heybuddy-gradient-end" fill="currentColor" />
            </div>
            <div className="st-orbit st-orbit-a">
              <Heart className="h-4 w-4 text-heybuddy-lavender/80" fill="currentColor" />
            </div>
            <div className="st-orbit st-orbit-b">
              <Heart className="h-4 w-4 text-heybuddy-gradient-start/70" fill="currentColor" />
            </div>
          </div>

          <div className="text-center">
            <div className="st-love-text text-xl font-extrabold tracking-tight text-heybuddy-dark-gray">
              {t('with_love')}
            </div>
            <div className="mt-1 text-sm text-heybuddy-dark-gray/70">
              {t('loading_your_space')}
            </div>
          </div>
        </div>

        <div className="h-[220px]" />
      </div>
    </div>
  );
}
