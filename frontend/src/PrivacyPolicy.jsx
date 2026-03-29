import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5 md:p-6">
        <h1 className="section-title">{t('privacy_policy')}</h1>
        <p className="text-sm text-soultalk-medium-gray mt-1">{t('privacy_last_updated')}</p>
      </div>

      <div className="card-elevated p-5 rounded-2xl space-y-4 text-sm text-soultalk-medium-gray">
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">
            {t('privacy_summary_title', { defaultValue: 'Quick Summary' })}
          </h2>
          <p>
            {t('privacy_summary_body', { defaultValue: 'SoulTalk helps you chat across languages. We collect only what we need to run the service, keep it secure, and improve reliability.' })}
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_summary_1', { defaultValue: 'You control your profile details and language settings.' })}</li>
            <li>{t('privacy_summary_2', { defaultValue: 'Feedback is optional and helps us fix issues faster.' })}</li>
            <li>{t('privacy_summary_3', { defaultValue: 'No system is perfect—use the app thoughtfully and report concerns.' })}</li>
          </ul>
        </section>

        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_1_title')}</h2>
          <p>{t('privacy_section_1_body')}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_store_1', { defaultValue: 'Profile: username, phone, and optional bio.' })}</li>
            <li>{t('privacy_store_2', { defaultValue: 'Preferences: language, UI settings, and basic app configuration.' })}</li>
            <li>{t('privacy_store_3', { defaultValue: 'Messages: content needed for chat functionality and translation display.' })}</li>
          </ul>
        </section>
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_2_title')}</h2>
          <p>{t('privacy_section_2_body')}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_use_1', { defaultValue: 'Deliver chats, translation, and login verification.' })}</li>
            <li>{t('privacy_use_2', { defaultValue: 'Prevent abuse, spam, and account takeover attempts.' })}</li>
            <li>{t('privacy_use_3', { defaultValue: 'Monitor uptime and troubleshoot bugs when reported.' })}</li>
          </ul>
        </section>
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_3_title')}</h2>
          <p>{t('privacy_section_3_body')}</p>
          <p className="mt-3">
            {t('privacy_security_more', { defaultValue: 'We work to protect your data with access controls, encryption where appropriate, and secure development practices.' })}
          </p>
        </section>
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_4_title')}</h2>
          <p>{t('privacy_section_4_body')}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_controls_1', { defaultValue: 'Update your UI language in Settings.' })}</li>
            <li>{t('privacy_controls_2', { defaultValue: 'Edit your profile photo and details from your profile screen.' })}</li>
            <li>{t('privacy_controls_3', { defaultValue: 'Contact us via Feedback for help, questions, or data requests.' })}</li>
          </ul>
        </section>

        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">
            {t('privacy_sharing_title', { defaultValue: 'Data Sharing' })}
          </h2>
          <p>
            {t('privacy_sharing_body', { defaultValue: 'We do not sell your personal data. We may share limited information only when needed to operate the service, comply with law, or protect users.' })}
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_sharing_1', { defaultValue: 'Service providers: hosting, monitoring, and delivery infrastructure.' })}</li>
            <li>{t('privacy_sharing_2', { defaultValue: 'Legal and safety: to comply with lawful requests or prevent harm.' })}</li>
          </ul>
        </section>

        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">
            {t('privacy_retention_title', { defaultValue: 'Data Retention' })}
          </h2>
          <p>
            {t('privacy_retention_body', { defaultValue: 'We keep data only as long as needed for the app to work, for security, and for legitimate operational reasons. Retention periods may vary depending on the type of data.' })}
          </p>
        </section>

        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">
            {t('privacy_children_title', { defaultValue: 'Children' })}
          </h2>
          <p>
            {t('privacy_children_body', { defaultValue: 'SoulTalk is not intended for children under the age of 13 (or the age required by local law). If you believe a child has provided personal data, contact us via Feedback.' })}
          </p>
        </section>

        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">
            {t('privacy_contact_title', { defaultValue: 'Contact' })}
          </h2>
          <p>
            {t('privacy_contact_body', { defaultValue: 'For privacy questions, data requests, or concerns, go to Settings → Feedback and send us a message.' })}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
