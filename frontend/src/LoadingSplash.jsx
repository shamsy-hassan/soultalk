import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default function LoadingSplash({ onDone }) {
  const prefersReducedMotion = getPrefersReducedMotion();
  // Total splash time (requested ~2s) for full page load/refresh.
  const firstMs = prefersReducedMotion ? 250 : 900;
  const gapMs = prefersReducedMotion ? 0 : 100;
  const secondMs = prefersReducedMotion ? 250 : 850;
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
    timers.push(
      setTimeout(() => setIsFadingOut(true), firstMs + gapMs + secondMs)
    );
    timers.push(
      setTimeout(() => {
        setPhase('done');
        onDoneRef.current?.();
      }, firstMs + gapMs + secondMs + fadeOutMs)
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
          <div className="st-heartbeat mb-5 rounded-3xl bg-white/75 px-7 py-7 shadow-[0_18px_60px_-40px_rgba(76,29,149,0.45)] backdrop-blur">
            <Heart className="h-12 w-12 text-soultalk-lavender" fill="currentColor" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tight text-soultalk-dark-gray">
              SoulTalk
            </div>
            <div className="mt-1 text-sm text-soultalk-dark-gray/70">
              Connecting hearts, across languages
            </div>
          </div>

          <div className="pointer-events-none absolute -top-6 left-8 st-float-1">
            <Heart className="h-5 w-5 text-soultalk-gradient-end/70" fill="currentColor" />
          </div>
          <div className="pointer-events-none absolute top-10 right-10 st-float-2">
            <Heart className="h-4 w-4 text-soultalk-lavender/70" fill="currentColor" />
          </div>
          <div className="pointer-events-none absolute -bottom-6 right-14 st-float-3">
            <Heart className="h-6 w-6 text-soultalk-gradient-start/60" fill="currentColor" />
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
            <div className="st-love-core rounded-3xl bg-white/80 px-8 py-8 shadow-[0_18px_60px_-40px_rgba(124,58,237,0.45)] backdrop-blur">
              <Heart className="h-12 w-12 text-soultalk-gradient-end" fill="currentColor" />
            </div>
            <div className="st-orbit st-orbit-a">
              <Heart className="h-4 w-4 text-soultalk-lavender/80" fill="currentColor" />
            </div>
            <div className="st-orbit st-orbit-b">
              <Heart className="h-4 w-4 text-soultalk-gradient-start/70" fill="currentColor" />
            </div>
          </div>

          <div className="text-center">
            <div className="st-love-text text-xl font-extrabold tracking-tight text-soultalk-dark-gray">
              With love
            </div>
            <div className="mt-1 text-sm text-soultalk-dark-gray/70">
              Loading your space…
            </div>
          </div>
        </div>

        <div className="h-[220px]" />
      </div>
    </div>
  );
}
