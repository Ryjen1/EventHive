import React, { createContext, useContext, useEffect, useState } from 'react'

type ReownState = {
  connected: boolean
  address: string | null
  isConnecting: boolean
  hashpack: any | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const ReownContext = createContext<ReownState | undefined>(undefined)

// HashPack wallet connection for Hedera
// This helper waits briefly for the HashPack extension to inject itself and
// supports multiple API shapes (getConnectionState or connectToLocalWallet).
const waitForHashPack = async (timeout = 5000, interval = 200) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (typeof window !== 'undefined' && (window as any).hashpack) {
      return (window as any).hashpack
    }
    // also check alternative injection names (defensive)
    if (typeof window !== 'undefined' && (window as any).HashPack) {
      return (window as any).HashPack
    }
    // small delay
    // eslint-disable-next-line no-await-in-loop
    await new Promise((res) => setTimeout(res, interval))
  }
  return null
}

const connectToHashPack = async () => {
  try {
    const hashpack = await waitForHashPack()
    if (!hashpack) {
      throw new Error('HashPack wallet not found')
    }

    // If HashPack exposes getConnectionState, prefer that to avoid re-prompting
    if (typeof hashpack.getConnectionState === 'function') {
      const existing = await hashpack.getConnectionState()
      if (existing && existing.accountIds && existing.accountIds.length > 0) {
        return { accountId: existing.accountIds[0], hashpack }
      }
    }

    // Fallback: try to connect via the local-wallet API
    if (typeof hashpack.connectToLocalWallet === 'function') {
      const initData = await hashpack.connectToLocalWallet()
      if (initData && initData.accountIds && initData.accountIds.length > 0) {
        return { accountId: initData.accountIds[0], hashpack }
      }
      throw new Error('No accounts found in HashPack')
    }

    throw new Error('HashPack API not recognized')
  } catch (error) {
    console.error('HashPack connection failed:', error)
    throw error
  }
}

const disconnectHashPack = async (hashpack: any) => {
  try {
    if (hashpack) {
      await hashpack.disconnect()
    }
    console.log('🔌 HashPack disconnected')
    return true
  } catch (error) {
    console.error('HashPack disconnect failed:', error)
    return false
  }
}

export const ReownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [hashpack, setHashpack] = useState<any | null>(null)

  useEffect(() => {
    // Check if HashPack is already connected
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      const hashpackInstance = await waitForHashPack(3000, 200)
      if (!hashpackInstance) return

      // Try to get existing connection using whichever API is available
      if (typeof hashpackInstance.getConnectionState === 'function') {
        const existingData = await hashpackInstance.getConnectionState()
        if (existingData && existingData.accountIds && existingData.accountIds.length > 0) {
          setAddress(existingData.accountIds[0])
          setConnected(true)
          setHashpack(hashpackInstance)
        }
        return
      }

      // If no connection state method, do nothing (user must connect)
    } catch (error) {
      console.log('No existing HashPack connection found')
    }
  }

  const connect = async () => {
    setIsConnecting(true)
    try {
      const result = await connectToHashPack()
      setAddress(result.accountId)
      setConnected(true)
      setHashpack(result.hashpack)
      
      // Show success message
      console.log('🎉 HashPack connected successfully!')
      
    } catch (err) {
      console.error('HashPack connect failed:', err)
      setConnected(false)
      setAddress(null)
      setHashpack(null)
      
      // Show user-friendly error
      if (err instanceof Error && err.message.includes('not found')) {
        alert('HashPack wallet not found. Please install HashPack from https://www.hashpack.app/ and try again.')
      } else {
        alert('Failed to connect to HashPack. Please make sure HashPack is installed and unlocked.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      if (hashpack) {
        await disconnectHashPack(hashpack)
      }
      setConnected(false)
      setAddress(null)
      setHashpack(null)
    } catch (err) {
      console.error('HashPack disconnect failed:', err)
    }
  }

  return (
    <ReownContext.Provider value={{ connected, address, isConnecting, hashpack, connect, disconnect }}>
      {children}
    </ReownContext.Provider>
  )
}

export const useReown = () => {
  const ctx = useContext(ReownContext)
  if (!ctx) throw new Error('useReown must be used within ReownProvider')
  return ctx
}
