// OpenPriceHub · App — /:lang 路由 + 全局 Provider

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LocaleProvider, isLocale, type Locale } from './i18n';
import { CurrencyProvider } from './context/CurrencyProvider';
import { CompareProvider } from './context/CompareContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Submit from './pages/Submit';
import Soon from './pages/Soon';

// 同步 <html lang>
function LocaleSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);
  return null;
}

function LocaleShell() {
  const { lang } = useParams();
  if (!isLocale(lang)) return <Navigate to="/zh" replace />;

  return (
    <LocaleProvider locale={lang}>
      <CurrencyProvider initial={lang === 'en' ? 'USD' : 'CNY'}>
        <CompareProvider>
          <LocaleSync locale={lang} />
          <Layout>
            <Routes>
              <Route index element={<Home />} />
              <Route path="tools" element={<Tools />} />
              <Route path="tools/:slug" element={<Soon />} />
              <Route path="compare" element={<Soon />} />
              <Route path="calculator" element={<Soon />} />
              <Route path="guides" element={<Soon />} />
              <Route path="submit" element={<Submit />} />
              <Route path="about" element={<Soon />} />
              <Route path="admin" element={<Soon />} />
              <Route path="*" element={<Soon />} />
            </Routes>
          </Layout>
        </CompareProvider>
      </CurrencyProvider>
    </LocaleProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/zh" replace />} />
        <Route path="/:lang/*" element={<LocaleShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
