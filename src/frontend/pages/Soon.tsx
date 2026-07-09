// OpenPriceHub · 占位页 (里程碑 2 待建页面)

import React from 'react';
import { Link } from 'react-router-dom';
import { useT, useLocalePath } from '../i18n';

function Soon() {
  const t = useT();
  const lp = useLocalePath();
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="eyebrow">OpenPriceHub</span>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">{t('soon.title')}</h1>
      <p className="mt-3 text-ink-2">{t('soon.desc')}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to={lp('/tools')} className="btn-primary">
          {t('soon.browse')}
        </Link>
        <Link to={lp('/')} className="btn-secondary">
          {t('soon.back')}
        </Link>
      </div>
    </div>
  );
}

export default Soon;
