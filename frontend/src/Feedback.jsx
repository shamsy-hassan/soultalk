import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitFeedback } from './api';

const Feedback = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setStatus('');
    try {
      await submitFeedback({
        username: user?.username || 'anonymous',
        email,
        category,
        message,
        language: user?.language || i18n.language || 'auto'
      });
      setStatus(t('feedback_sent_success'));
      setMessage('');
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

      <form onSubmit={onSubmit} className="card-elevated p-5 rounded-2xl space-y-3">
        <label className="block text-sm text-soultalk-dark-gray">
          {t('feedback_email_optional')}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1 border-gray-200 bg-white/95"
            placeholder={t('feedback_email_placeholder')}
          />
        </label>

        <label className="block text-sm text-soultalk-dark-gray">
          {t('feedback_category')}
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field mt-1 border-gray-200 bg-white/95">
            <option value="general">{t('feedback_category_general')}</option>
            <option value="bug">{t('feedback_category_bug')}</option>
            <option value="feature">{t('feedback_category_feature')}</option>
            <option value="ux">{t('feedback_category_ux')}</option>
          </select>
        </label>

        <label className="block text-sm text-soultalk-dark-gray">
          {t('feedback_message')}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field mt-1 border-gray-200 bg-white/95"
            rows={5}
            placeholder={t('feedback_message_placeholder')}
            required
          />
        </label>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {sending ? t('sending') : t('send_feedback')}
        </button>

        {status && <p className="text-sm text-soultalk-medium-gray rounded-lg bg-soultalk-warm-gray/60 px-3 py-2 border border-gray-100">{status}</p>}
      </form>
    </div>
  );
};

export default Feedback;
