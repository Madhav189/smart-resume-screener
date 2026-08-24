import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CandidateDetail from './components/CandidateDetail';
import CandidatesList from './components/CandidatesList';
import Upload from './components/Upload';
import Compare from './components/Compare';

// Placeholder Pages for new structure
const JobsList = () => <div className="p-8"><h1 className="text-3xl font-bold mb-4">Jobs</h1></div>;
const JobDetail = () => <div className="p-8"><h1 className="text-3xl font-bold mb-4">Job Detail</h1></div>;
const Settings = () => <div className="p-8"><h1 className="text-3xl font-bold mb-4">Settings</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
