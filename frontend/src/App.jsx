import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppSetup from './pages/AppSetup';
import EnvSetup from './pages/EnvSetup';
import DeployStatus from './pages/DeployStatus';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    owner: 'Adith Narain T',
    region: '',
    framework: '',
    plan_type: '',
    repo_url: '',
    repo_name: 'Kuberns Page',
    branch: 'main',
  });

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Navbar />
        <Routes>
          <Route path="/" element={<AppSetup formData={formData} setFormData={setFormData} />} />
          <Route path="/env-setup" element={<EnvSetup formData={formData} setFormData={setFormData} />} />
          <Route path="/deploy-status" element={<DeployStatus />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
