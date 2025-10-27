import { useMemo } from 'react';
import { AccountId } from '@hashgraph/sdk';
import { useDAppConnector } from './ClientProviders';
import { WalletInterface, NFTCreateOptions, NFTMintOptions } from './walletInterface';

class BasicWalletInterface implements WalletInterface {
  constructor(private _dAppConnector: any) {
    void this._dAppConnector;
  }

  async createFile(_data: Uint8Array): Promise<any> {
    // Implement using dAppConnector
    void _data;
    throw new Error('Not implemented');
  }

  async createNFTCollection(_options: NFTCreateOptions): Promise<any> {
    // Implement using dAppConnector
    void _options;
    throw new Error('Not implemented');
  }

  async mintNFT(_options: NFTMintOptions): Promise<any> {
    // Implement using dAppConnector
    void _options;
    throw new Error('Not implemented');
  }

  async transferNonFungibleToken(_tokenId: any, _toAccountId: AccountId, _serialNumber: number): Promise<any> {
    // Implement using dAppConnector
    void _tokenId;
    void _toAccountId;
    void _serialNumber;
    throw new Error('Not implemented');
  }

  async associateToken(_tokenId: any): Promise<any> {
    // Implement using dAppConnector
    void _tokenId;
    throw new Error('Not implemented');
  }
}

export const useWalletInterface = () => {
  const { dAppConnector, userAccountId, isConnected } = useDAppConnector();

  const accountId = useMemo(() => {
    return userAccountId || null;
  }, [userAccountId]);

  const walletInterface = useMemo(() => {
    if (dAppConnector && isConnected) {
      return new BasicWalletInterface(dAppConnector);
    }
    return null;
  }, [dAppConnector, isConnected]);

  return { accountId, walletInterface };
};