import { useDAppConnector } from '../services/wallets/ClientProviders'

export function WalletButton() {
  const { dAppConnector, userAccountId, disconnect, refresh, isConnected } = useDAppConnector()

  const handleLogin = async () => {
    if (dAppConnector) {
      try {
        console.log('Opening wallet connection modal...')
        await dAppConnector.openModal()
        if (refresh) refresh()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  const handleDisconnect = () => {
    if (disconnect) {
      void disconnect()
    }
  }

  if (!isConnected || !userAccountId) {
    return (
      <button
        className="wallet-connect-btn"
        onClick={handleLogin}
        disabled={!dAppConnector}
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontWeight: '600',
          cursor: dAppConnector ? 'pointer' : 'not-allowed',
          opacity: dAppConnector ? 1 : 0.6,
          transition: 'all 0.3s ease',
          fontSize: '14px',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (dAppConnector) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6)'
          }
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)'
        }}
      >
        🔗 Connect Wallet
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        padding: '8px 16px',
        background: 'rgba(212, 175, 55, 0.1)',
        color: '#D4AF37',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        {`${userAccountId.slice(0, 6)}...${userAccountId.slice(-4)}`}
      </div>
      <button
        style={{
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#666',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '13px'
        }}
        onClick={handleDisconnect}
        disabled={!dAppConnector}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        Disconnect
      </button>
    </div>
  )
}