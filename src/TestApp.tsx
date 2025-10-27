import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'

// Simple test components
const TestHome = () => (
  <div style={{ padding: '20px', color: 'white' }}>
    <h1>🎫 Hedera Ticketing Platform</h1>
    <p>Welcome to the decentralized event ticketing platform!</p>
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
      <h3>Quick Test</h3>
      <p>✅ React is working</p>
      <p>✅ Router is working</p>
      <p>✅ CSS is loading</p>
      <p>🔄 Wallet integration disabled for testing</p>
    </div>
  </div>
)

const TestEvents = () => (
  <div style={{ padding: '20px', color: 'white' }}>
    <h1>🎪 Events</h1>
    <p>This is the events page - wallet integration will be re-enabled soon.</p>
  </div>
)

const TestCreateEvent = () => (
  <div style={{ padding: '20px', color: 'white' }}>
    <h1>➕ Create Event</h1>
    <p>This is the create event page - wallet integration will be re-enabled soon.</p>
  </div>
)

const AppContent = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const onNavigate = (_path: string) => {
    // For test app, no navigation needed
    void _path;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="/events" element={<TestEvents />} />
        <Route path="/create-event" element={<TestCreateEvent />} />
        <Route path="*" element={<TestHome />} />
      </Routes>
    </div>
  );
};

export default function TestApp() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}