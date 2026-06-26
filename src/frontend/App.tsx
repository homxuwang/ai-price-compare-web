// AI Price Compare Web - App 组件

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SEO from './components/SEO';
import Home from './pages/Home';
import Platforms from './pages/Platforms';
import PlatformDetail from './pages/PlatformDetail';
import Models from './pages/Models';
import ModelDetail from './pages/ModelDetail';
import Compare from './pages/Compare';
import Submit from './pages/Submit';
import About from './pages/About';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <SEO />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/platforms/:id" element={<PlatformDetail />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:id" element={<ModelDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
