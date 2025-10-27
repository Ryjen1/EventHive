import { BrowserRouter as Router } from 'react-router-dom'
import { ClientProviders } from './services/wallets/ClientProviders'
import AppRouter from './AppRouter'

export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <ClientProviders>
        <Router>
          <AppRouter />
        </Router>
      </ClientProviders>
    </div>
  )
}
