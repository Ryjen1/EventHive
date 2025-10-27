import React, { createContext, useContext, useState, useCallback } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: string | null;
  isConnecting: boolean;
}

interface SimpleWalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  openWalletModal: () => void;
}

const SimpleWalletContext = createContext<SimpleWalletContextType | undefined>(undefined);

// Simple wallet connection using basic web3 modal approach
export const SimpleWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    isConnecting: false,
  });

  const connectWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Check for MetaMask first
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setWallet({
            isConnected: true,
            address: accounts[0],
            walletType: 'MetaMask',
            isConnecting: false,
          });
          console.log('✅ MetaMask connected:', accounts[0]);
          return;
        }
      }
      
      // Check for HashPack
      if (typeof window !== 'undefined' && (window as any).hashpack) {
        const hashpack = (window as any).hashpack;
        const data = await hashpack.connectToLocalWallet();
        
        if (data.accountIds && data.accountIds.length > 0) {
          setWallet({
            isConnected: true,
            address: data.accountIds[0],
            walletType: 'HashPack',
            isConnecting: false,
          });
          console.log('✅ HashPack connected:', data.accountIds[0]);
          return;
        }
      }
      
      throw new Error('No wallet found');
      
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      alert('Please install HashPack or MetaMask wallet to continue');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      walletType: null,
      isConnecting: false,
    });
    console.log('🔌 Wallet disconnected');
  }, []);

  const openWalletModal = useCallback(async () => {
    // Simple modal - just trigger connection
    if (!wallet.isConnected) {
      await connectWallet();
    } else {
      // Show options to disconnect
      const shouldDisconnect = window.confirm(`Connected to ${wallet.walletType}\nAddress: ${wallet.address}\n\nDisconnect wallet?`);
      if (shouldDisconnect) {
        disconnectWallet();
      }
    }
  }, [wallet.isConnected, wallet.walletType, wallet.address, connectWallet, disconnectWallet]);

  return (
    <SimpleWalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        openWalletModal,
      }}
    >
      {children}
    </SimpleWalletContext.Provider>
  );
};

export const useSimpleWallet = () => {
  const context = useContext(SimpleWalletContext);
  if (context === undefined) {
    throw new Error('useSimpleWallet must be used within a SimpleWalletProvider');
  }
  return context;
};

// Simple helper to detect available wallets
export const getAvailableWallets = () => {
  const wallets = [];
  
  if (typeof window !== 'undefined') {
    if ((window as any).ethereum) {
      wallets.push('MetaMask');
    }
    if ((window as any).hashpack) {
      wallets.push('HashPack');
    }
  }
  
  return wallets;
};