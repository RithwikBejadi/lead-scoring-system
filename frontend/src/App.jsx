import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import ScoringRules from './pages/ScoringRules';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/leads" replace />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/rules" element={<ScoringRules />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
