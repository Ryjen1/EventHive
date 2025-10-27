import React, { createContext, useContext, useEffect, useState } from 'react'

interface HashpackState {
  connected: boolean
  accountId: string | null
  isConnecting: boolean
  hashpack: any | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transactionBytes: Uint8Array) => Promise<Uint8Array>
}

const HashpackContext = createContext<HashpackState | undefined>(undefined)

// Simple HashPack detection and connection
const waitForHashPack = async (timeout = 5000, interval = 200) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (typeof window !== 'undefined' && (window as any).hashpack) {
      return (window as any).hashpack
    }
    await new Promise((res) => setTimeout(res, interval))
  }
  return null
}

export const HashpackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [hashpack, setHashpack] = useState<any | null>(null)

  useEffect(() => {
    checkForHashPack()
  }, [])

  const checkForHashPack = async () => {
    try {
      const hashpackInstance = await waitForHashPack(3000, 200)
      if (hashpackInstance) {
        setHashpack(hashpackInstance)
        
        // Check for existing connection
        if (typeof hashpackInstance.getConnectionState === 'function') {
          try {
            const connectionState = await hashpackInstance.getConnectionState()
            if (connectionState && connectionState.accountIds && connectionState.accountIds.length > 0) {
              setAccountId(connectionState.accountIds[0])
              setConnected(true)
              console.log('✅ Found existing HashPack connection:', connectionState.accountIds[0])
            }
          } catch (error) {
            console.log('No existing HashPack connection')
          }
        }
      }
    } catch (error) {
      console.log('HashPack not available')
    }
  }

  const connect = async () => {
    if (!hashpack) {
      throw new Error('HashPack not available')
    }

    setIsConnecting(true)
    try {
      // Try to connect using HashPack's API
      const connectionData = await hashpack.connectToLocalWallet()
      
      if (connectionData && connectionData.accountIds && connectionData.accountIds.length > 0) {
        setAccountId(connectionData.accountIds[0])
        setConnected(true)
        console.log('🎉 HashPack connected successfully:', connectionData.accountIds[0])
      } else {
        throw new Error('No accounts found in HashPack')
      }
    } catch (error) {
      console.error('HashPack connection failed:', error)
      setIsConnecting(false)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      if (hashpack && hashpack.disconnect) {
        await hashpack.disconnect()
      }
      setConnected(false)
      setAccountId(null)
      console.log('🔌 HashPack disconnected')
    } catch (error) {
      console.error('HashPack disconnect failed:', error)
    }
  }

  const signTransaction = async (transactionBytes: Uint8Array): Promise<Uint8Array> => {
    if (!hashpack || !connected || !accountId) {
      throw new Error('HashPack not connected')
    }

    try {
      // Use HashPack's signing API
      const signResponse = await hashpack.sign(transactionBytes, accountId)
      
      console.log('✅ Transaction signed successfully')
      
      // Return the signed transaction bytes
      return signResponse.signedTransaction || transactionBytes
    } catch (error) {
      console.error('Transaction signing failed:', error)
      throw error
    }
  }

  const value: HashpackState = {
    connected,
    accountId,
    isConnecting,
    hashpack,
    signTransaction,
    connect,
    disconnect
  }

  return (
    <HashpackContext.Provider value={value}>
      {children}
    </HashpackContext.Provider>
  )
}

export const useHashpack = () => {
  const context = useContext(HashpackContext)
  if (!context) {
    throw new Error('useHashpack must be used within HashpackProvider')
  }
  return context
}