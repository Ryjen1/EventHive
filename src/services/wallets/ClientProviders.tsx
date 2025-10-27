import { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect'
import { LedgerId } from '@hashgraph/sdk'

// Simple loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p>Initializing Hedera Wallet Connection...</p>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  </div>
)

interface WalletEvent {
  name: string
  data: {
    topic?: string
    [key: string]: unknown
  }
}

interface DAppConnectorWithEvents extends DAppConnector {
  events$?: {
    subscribe: (callback: (event: WalletEvent) => void) => { unsubscribe: () => void }
  }
}

// WalletConnect project ID from Vite environment configuration
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? ''
const queryClient = new QueryClient()

const metadata = {
  name: 'EventHive',
  description: 'Decentralized event ticketing platform on Hedera',
  url: 'https://hedera.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

type DAppConnectorContextType = {
  dAppConnector: DAppConnector | null
  userAccountId: string | null
  sessionTopic: string | null
  disconnect: (() => Promise<void>) | null
  refresh: (() => void) | null
  isConnected: boolean
}

const DAppConnectorContext = createContext<DAppConnectorContextType | null>(null)

export const useDAppConnector = () => {
  const context = useContext(DAppConnectorContext)
  if (!context) {
    // Return safe defaults instead of throwing error during development
    console.warn('useDAppConnector called outside of ClientProviders context, returning defaults')
    return {
      dAppConnector: null,
      userAccountId: null,
      sessionTopic: null,
      disconnect: async () => {},
      refresh: () => {},
      isConnected: false
    }
  }
  return context
}

type ClientProvidersProps = {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [userAccountId, setUserAccountId] = useState<string | null>(null)
  const [sessionTopic, setSessionTopic] = useState<string | null>(null)

  // Listen for account/session changes using events$
  useEffect(() => {
    if (!dAppConnector) return

    const connectorWithEvents = dAppConnector as DAppConnectorWithEvents
    const subscription = connectorWithEvents.events$?.subscribe((event: WalletEvent) => {
      console.log('Wallet event:', event)
      
      if (event.name === 'accountsChanged' || event.name === 'chainChanged') {
        const accountId = dAppConnector.signers?.[0]?.getAccountId().toString() ?? null
        setUserAccountId(accountId)
        
        if (event.data && event.data.topic) {
          setSessionTopic(event.data.topic)
        } else if (dAppConnector.signers?.[0]?.topic) {
          setSessionTopic(dAppConnector.signers[0].topic)
        } else {
          setSessionTopic(null)
        }
      } else if (event.name === 'session_delete' || event.name === 'sessionDelete') {
        setUserAccountId(null)
        setSessionTopic(null)
      }
    })

    // Set initial state
    const initialAccountId = dAppConnector.signers?.[0]?.getAccountId().toString() ?? null
    setUserAccountId(initialAccountId)
    
    if (dAppConnector.signers?.[0]?.topic) {
      setSessionTopic(dAppConnector.signers[0].topic)
    }
    
    return () => subscription && subscription.unsubscribe()
  }, [dAppConnector])

  // Provide a disconnect function
  const disconnect = async () => {
    if (dAppConnector && sessionTopic) {
      await dAppConnector.disconnect(sessionTopic)
      setUserAccountId(null)
      setSessionTopic(null)
    }
  }

  // Provide a refresh function
  const refresh = () => {
    if (dAppConnector) {
      const accountId = dAppConnector.signers?.[0]?.getAccountId().toString() ?? null
      setUserAccountId(accountId)
      setSessionTopic(dAppConnector.signers?.[0]?.topic ?? null)
    }
  }

  useEffect(() => {
    let isMounted = true
    async function init() {
      try {
        if (!projectId) {
          console.error('❌ VITE_WALLETCONNECT_PROJECT_ID is not set. Unable to initialize Hedera WalletConnect.')
          if (isMounted) {
            setIsReady(true)
          }
          return
        }

        console.log('🔄 Initializing Hedera DApp Connector...')
        
        const connector = new DAppConnector(
          metadata,
          LedgerId.TESTNET,
          projectId,
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [HederaChainId.Mainnet, HederaChainId.Testnet]
        )
        
        // Add timeout to prevent hanging
        const initPromise = connector.init()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DApp connector initialization timeout')), 10000)
        )
        
        await Promise.race([initPromise, timeoutPromise])
        
        if (isMounted) {
          setDAppConnector(connector)
          setIsReady(true)
          console.log('✅ Hedera DApp Connector initialized successfully')
        }
      } catch (error) {
        console.warn('⚠️ DApp Connector initialization failed:', error)
        console.log('📱 App will continue without wallet connection')
        if (isMounted) {
          setIsReady(true) // Always set ready to prevent infinite loading
        }
      }
    }
    
    init()
    
    return () => {
      isMounted = false
    }
  }, [])

  if (!isReady) {
    return <LoadingSpinner />
  }

  const isConnected = Boolean(userAccountId && sessionTopic)

  return (
    <DAppConnectorContext.Provider
      value={{
        dAppConnector,
        userAccountId,
        sessionTopic,
        disconnect,
        refresh,
        isConnected
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </DAppConnectorContext.Provider>
  )
}
