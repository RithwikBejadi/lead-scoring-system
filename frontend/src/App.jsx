import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LeadsList from './pages/LeadsList';
import LeadDetail from './pages/LeadDetail';
import CreateEvent from './pages/CreateEvent';
import Leaderboard from './pages/Leaderboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Lead Scoring System</h1>
          <div className="nav-links">
            <Link to="/">Leads</Link>
            <Link to="/events">Fire Event</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
        </nav>
        
        <main className="container">
          <Routes>
            <Route path="/" element={<LeadsList />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/events" element={<CreateEvent />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
