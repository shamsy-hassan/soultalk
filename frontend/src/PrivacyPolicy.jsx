import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5 md:p-6">
        <h1 className="section-title">{t('privacy_policy')}</h1>
        <p className="text-sm text-heybuddy-medium-gray mt-1">{t('privacy_last_updated')}</p>
      </div>

      <div className="card-elevated p-5 rounded-2xl space-y-4 text-sm text-heybuddy-medium-gray">
          <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
            <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">
            {t('privacy_summary_title')}
            </h2>
          <p>
            {t('privacy_summary_body')}
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_summary_1')}</li>
            <li>{t('privacy_summary_2')}</li>
            <li>{t('privacy_summary_3')}</li>
          </ul>
        </section>

        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">{t('privacy_section_1_title')}</h2>
          <p>{t('privacy_section_1_body')}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_store_1')}</li>
            <li>{t('privacy_store_2')}</li>
            <li>{t('privacy_store_3')}</li>
          </ul>
        </section>
        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">{t('privacy_section_2_title')}</h2>
          <p>{t('privacy_section_2_body')}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_use_1')}</li>
            <li>{t('privacy_use_2')}</li>
            <li>{t('privacy_use_3')}</li>
          </ul>
        </section>
        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">{t('privacy_section_3_title')}</h2>
          <p>{t('privacy_section_3_body')}</p>
          <p className="mt-3">
            {t('privacy_security_more')}
          </p>
        </section>
        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">{t('privacy_section_4_title')}</h2>
          <p>{t('privacy_section_4_body')}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_controls_1')}</li>
            <li>{t('privacy_controls_2')}</li>
            <li>{t('privacy_controls_3')}</li>
          </ul>
        </section>

        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">
            {t('privacy_sharing_title')}
          </h2>
          <p>
            {t('privacy_sharing_body')}
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>{t('privacy_sharing_1')}</li>
            <li>{t('privacy_sharing_2')}</li>
          </ul>
        </section>

        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">
            {t('privacy_retention_title')}
          </h2>
          <p>
            {t('privacy_retention_body')}
          </p>
        </section>

        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">
            {t('privacy_children_title')}
          </h2>
          <p>
            {t('privacy_children_body')}
          </p>
        </section>

        <section className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4">
          <h2 className="text-base font-semibold text-heybuddy-dark-gray mb-1">
            {t('privacy_contact_title')}
          </h2>
          <p>
            {t('privacy_contact_body')}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
