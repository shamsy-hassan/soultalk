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
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-gray-100 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_1_title')}</h2>
          <p>{t('privacy_section_1_body')}</p>
        </section>
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-gray-100 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_2_title')}</h2>
          <p>{t('privacy_section_2_body')}</p>
        </section>
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-gray-100 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_3_title')}</h2>
          <p>{t('privacy_section_3_body')}</p>
        </section>
        <section className="rounded-xl bg-soultalk-warm-gray/35 border border-gray-100 p-4">
          <h2 className="text-base font-semibold text-soultalk-dark-gray mb-1">{t('privacy_section_4_title')}</h2>
          <p>{t('privacy_section_4_body')}</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
