import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitFeedback } from './api';

const TECH_DETAILS = () => {
  if (typeof window === 'undefined') return '';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const when = new Date().toISOString();
  return [
    `Time: ${when}`,
    `Timezone: ${tz || 'unknown'}`,
    `User agent: ${window.navigator?.userAgent || 'unknown'}`,
    `URL: ${window.location?.href || 'unknown'}`,
  ].join('\n');
};

const Feedback = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [includeTechDetails, setIncludeTechDetails] = useState(true);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setStatus('');

    const composed = [
      message.trim(),
      category === 'bug' && steps.trim() ? `\n\nSteps to reproduce:\n${steps.trim()}` : '',
      category === 'bug' && expected.trim() ? `\n\nExpected result:\n${expected.trim()}` : '',
      includeTechDetails ? `\n\n---\nTechnical details (auto):\n${TECH_DETAILS()}` : '',
    ]
      .filter(Boolean)
      .join('');

    try {
      await submitFeedback({
        username: user?.username || 'anonymous',
        email,
        category,
        message: composed,
        language: user?.language || i18n.language || 'auto'
      });
      setStatus(t('feedback_sent_success'));
      setMessage('');
      setSteps('');
      setExpected('');
    } catch (error) {
      setStatus(t('feedback_sent_failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5 md:p-6">
        <h1 className="section-title">{t('send_feedback')}</h1>
        <p className="text-sm text-soultalk-medium-gray mt-1">{t('feedback_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <aside className="card-elevated p-5 rounded-2xl space-y-3 xl:order-2">
          <h2 className="text-lg font-semibold text-soultalk-dark-gray">
            {t('feedback_tips_title', { defaultValue: 'Tips for faster help' })}
          </h2>
          <ul className="text-sm text-soultalk-medium-gray list-disc pl-5 space-y-1">
            <li>{t('feedback_tip_1', { defaultValue: 'Pick the closest category (Bug / Feature / UX).' })}</li>
            <li>{t('feedback_tip_2', { defaultValue: 'Describe what you expected vs what happened.' })}</li>
            <li>{t('feedback_tip_3', { defaultValue: 'If it’s a bug, include steps to reproduce.' })}</li>
          </ul>
          <div className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-soultalk-medium-gray">
            {t('feedback_privacy_note', { defaultValue: 'Avoid sending passwords, OTP codes, or sensitive personal info in feedback.' })}
          </div>
        </aside>

        <form onSubmit={onSubmit} className="card-elevated p-5 rounded-2xl space-y-3 xl:col-span-2 xl:order-1">
        <label className="block text-sm text-soultalk-dark-gray dark:text-gray-100">
          {t('feedback_email_optional')}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1"
            placeholder={t('feedback_email_placeholder')}
          />
        </label>

        <label className="block text-sm text-soultalk-dark-gray dark:text-gray-100">
          {t('feedback_category')}
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field mt-1">
            <option value="general">{t('feedback_category_general')}</option>
            <option value="bug">{t('feedback_category_bug')}</option>
            <option value="feature">{t('feedback_category_feature')}</option>
            <option value="ux">{t('feedback_category_ux')}</option>
          </select>
        </label>

        <label className="block text-sm text-soultalk-dark-gray dark:text-gray-100">
          {t('feedback_message')}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field mt-1"
            rows={5}
            placeholder={t('feedback_message_placeholder')}
            maxLength={2000}
            required
          />
        </label>

        {category === 'bug' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block text-sm text-soultalk-dark-gray dark:text-gray-100">
              {t('feedback_steps', { defaultValue: 'Steps to reproduce (optional)' })}
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="input-field mt-1"
                rows={4}
                placeholder={t('feedback_steps_placeholder', { defaultValue: '1) Open Chats\n2) Tap ...\n3) See error' })}
                maxLength={2000}
              />
            </label>

            <label className="block text-sm text-soultalk-dark-gray dark:text-gray-100">
              {t('feedback_expected', { defaultValue: 'Expected result (optional)' })}
              <textarea
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="input-field mt-1"
                rows={4}
                placeholder={t('feedback_expected_placeholder', { defaultValue: 'What should have happened?' })}
                maxLength={2000}
              />
            </label>
          </div>
        )}

        <label className="flex items-start gap-3 rounded-2xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <input
            type="checkbox"
            checked={includeTechDetails}
            onChange={(e) => setIncludeTechDetails(e.target.checked)}
            className="mt-1"
          />
          <span className="min-w-0">
            <span className="block font-semibold text-soultalk-dark-gray">
              {t('feedback_include_tech', { defaultValue: 'Include technical details' })}
            </span>
            <span className="block text-sm text-soultalk-medium-gray mt-1">
              {t('feedback_include_tech_desc', { defaultValue: 'Adds device/browser info to help us debug (recommended for bugs).' })}
            </span>
          </span>
        </label>

        <div className="flex items-center justify-between gap-3 text-xs text-soultalk-medium-gray">
          <span>{t('feedback_char_count', { defaultValue: 'Characters' })}: {message.length}/2000</span>
          <span>{t('feedback_response_note', { defaultValue: 'We may reply if you include an email address.' })}</span>
        </div>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {sending ? t('sending') : t('send_feedback')}
        </button>

        {status && <p className="text-sm text-soultalk-medium-gray dark:text-gray-200 rounded-lg bg-soultalk-warm-gray/60 dark:bg-white/5 px-3 py-2 border border-gray-100 dark:border-white/10">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default Feedback;
