import { useMemo } from 'react';
import {
  AccountId,
  FileId,
  TokenId,
  TransactionId,
  Client,
  FileCreateTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TransferTransaction,
  TokenAssociateTransaction,
  TokenType,
  Hbar
} from '@hashgraph/sdk';
import { useDAppConnector } from './ClientProviders';
import { WalletInterface, NFTCreateOptions, NFTMintOptions } from './walletInterface';

class BasicWalletInterface implements WalletInterface {
  constructor(private _dAppConnector: any) {
    if (!this._dAppConnector) {
      throw new Error('DAppConnector is required');
    }
  }

  async createFile(data: Uint8Array): Promise<FileId> {
    console.log('🔄 BasicWalletInterface.createFile called');
    if (!this._dAppConnector || !this._dAppConnector.signers?.[0]) {
      console.log('❌ No DAppConnector or signers available');
      throw new Error('Wallet not connected');
    }

    try {
      const signer = this._dAppConnector.signers[0];
      const accountId = signer.getAccountId();
      console.log('🔄 Creating file with signer:', accountId.toString());

      // Create client for testnet
      const client = Client.forTestnet();

      // Create file transaction
      const transaction = new FileCreateTransaction()
        .setContents(data)
        .setKeys([signer.getAccountKey()])
        .setMaxTransactionFee(new Hbar(2));

      // Generate transaction ID and freeze
      const txId = TransactionId.generate(accountId);
      transaction.setTransactionId(txId);

      const frozenTx = await transaction.freeze();
      const signedTx = await signer.signTransaction(frozenTx);
      const response = await signedTx.execute(client);
      const receipt = await response.getReceipt(client);

      await client.close();
      return receipt.fileId!;
    } catch (error) {
      console.error('Error creating file:', error);
      throw new Error(`Failed to create file on Hedera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createNFTCollection(options: NFTCreateOptions): Promise<TokenId> {
    if (!this._dAppConnector || !this._dAppConnector.signers?.[0]) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = this._dAppConnector.signers[0];
      const accountId = signer.getAccountId();

      // Create client for testnet
      const client = Client.forTestnet();

      // Create NFT collection transaction
      const transaction = new TokenCreateTransaction()
        .setTokenName(options.name)
        .setTokenSymbol(options.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setInitialSupply(0)
        .setMaxSupply(options.maxSupply)
        .setTreasuryAccountId(options.treasuryAccount)
        .setAdminKey(signer.getAccountKey())
        .setSupplyKey(signer.getAccountKey())
        .setMetadataKey(signer.getAccountKey())
        .setMaxTransactionFee(new Hbar(30));

      // Generate transaction ID and freeze
      const txId = TransactionId.generate(accountId);
      transaction.setTransactionId(txId);

      const frozenTx = await transaction.freeze();
      const signedTx = await signer.signTransaction(frozenTx);
      const response = await signedTx.execute(client);
      const receipt = await response.getReceipt(client);

      await client.close();
      return receipt.tokenId!;
    } catch (error) {
      console.error('Error creating NFT collection:', error);
      throw new Error(`Failed to create NFT collection on Hedera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async mintNFT(options: NFTMintOptions): Promise<TransactionId> {
    console.log('🔄 BasicWalletInterface.mintNFT called for token:', options.tokenId.toString());
    if (!this._dAppConnector || !this._dAppConnector.signers?.[0]) {
      console.log('❌ No DAppConnector or signers available');
      throw new Error('Wallet not connected');
    }

    try {
      const signer = this._dAppConnector.signers[0];
      const accountId = signer.getAccountId();
      console.log('🔄 Minting NFT with signer:', accountId.toString());

      // Create client for testnet
      const client = Client.forTestnet();

      // Mint NFT transaction
      const transaction = new TokenMintTransaction()
        .setTokenId(options.tokenId)
        .setMetadata(options.metadata)
        .setMaxTransactionFee(new Hbar(10));

      // Generate transaction ID and freeze
      const txId = TransactionId.generate(accountId);
      transaction.setTransactionId(txId);

      const frozenTx = await transaction.freeze();
      const signedTx = await signer.signTransaction(frozenTx);
      const response = await signedTx.execute(client);

      await client.close();
      return response.transactionId;
    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Failed to mint NFT on Hedera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transferNonFungibleToken(toAccountId: AccountId, tokenId: TokenId, serialNumber: number): Promise<TransactionId> {
    if (!this._dAppConnector || !this._dAppConnector.signers?.[0]) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = this._dAppConnector.signers[0];
      const accountId = signer.getAccountId();

      // Create client for testnet
      const client = Client.forTestnet();

      // Transfer NFT transaction
      const transaction = new TransferTransaction()
        .addNftTransfer(tokenId, serialNumber, accountId, toAccountId)
        .setMaxTransactionFee(new Hbar(2));

      // Generate transaction ID and freeze
      const txId = TransactionId.generate(accountId);
      transaction.setTransactionId(txId);

      const frozenTx = await transaction.freeze();
      const signedTx = await signer.signTransaction(frozenTx);
      const response = await signedTx.execute(client);

      await client.close();
      return response.transactionId;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw new Error(`Failed to transfer NFT on Hedera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async associateToken(tokenId: TokenId): Promise<TransactionId> {
    if (!this._dAppConnector || !this._dAppConnector.signers?.[0]) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = this._dAppConnector.signers[0];
      const accountId = signer.getAccountId();

      // Create client for testnet
      const client = Client.forTestnet();

      // Associate token transaction
      const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .setMaxTransactionFee(new Hbar(2));

      // Generate transaction ID and freeze
      const txId = TransactionId.generate(accountId);
      transaction.setTransactionId(txId);

      const frozenTx = await transaction.freeze();
      const signedTx = await signer.signTransaction(frozenTx);
      const response = await signedTx.execute(client);

      await client.close();
      return response.transactionId;
    } catch (error) {
      console.error('Error associating token:', error);
      throw new Error(`Failed to associate token on Hedera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const useWalletInterface = () => {
  const { dAppConnector, userAccountId, isConnected } = useDAppConnector();

  const accountId = useMemo(() => {
    return userAccountId || null;
  }, [userAccountId]);

  const walletInterface = useMemo(() => {
    if (dAppConnector && isConnected && userAccountId) {
      try {
        // Check if we have active signers
        if (dAppConnector.signers && dAppConnector.signers.length > 0) {
          console.log('🔗 Using real wallet interface with connected wallet');
          console.log('🔗 Available signers:', dAppConnector.signers.length);
          console.log('🔗 Account ID:', userAccountId);
          return new BasicWalletInterface(dAppConnector);
        } else {
          console.log('⚠️ No active signers found, using mock interface');
          return new MockWalletInterface();
        }
      } catch (error) {
        console.warn('❌ Real wallet interface failed, falling back to mock:', error);
        return new MockWalletInterface();
      }
    }
    console.log('📱 No wallet connected, using mock interface for development');
    return new MockWalletInterface();
  }, [dAppConnector, isConnected, userAccountId]);

  return { accountId, walletInterface };
};

// Mock wallet interface for development/testing
class MockWalletInterface implements WalletInterface {
  async createFile(data: Uint8Array): Promise<FileId> {
    console.log('Mock: Creating file with data length:', data.length);
    // Generate a mock file ID
    const mockFileId = `0.0.${1000000 + Math.floor(Math.random() * 9000000)}`;
    return FileId.fromString(mockFileId);
  }

  async createNFTCollection(options: NFTCreateOptions): Promise<TokenId> {
    console.log('Mock: Creating NFT collection:', options.name);
    // Generate a mock token ID
    const mockTokenId = `0.0.${1000000 + Math.floor(Math.random() * 9000000)}`;
    return TokenId.fromString(mockTokenId);
  }

  async mintNFT(options: NFTMintOptions): Promise<TransactionId> {
    console.log('🎭 Mock: Minting NFT for token:', options.tokenId.toString());

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a mock transaction ID
    const mockTxId = `0.0.${1000000 + Math.floor(Math.random() * 9000000)}@${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000)}`;

    console.log('🎭 Mock: NFT minted successfully with transaction:', mockTxId);

    return TransactionId.fromString(mockTxId);
  }

  async transferNonFungibleToken(toAccountId: AccountId, tokenId: TokenId, serialNumber: number): Promise<TransactionId> {
    console.log('Mock: Transferring NFT:', tokenId.toString(), 'serial:', serialNumber, 'to:', toAccountId.toString());
    // Generate a mock transaction ID
    const mockTxId = `0.0.${1000000 + Math.floor(Math.random() * 9000000)}@${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000)}`;
    return TransactionId.fromString(mockTxId);
  }

  async associateToken(tokenId: TokenId): Promise<TransactionId> {
    console.log('Mock: Associating token:', tokenId.toString());
    // Generate a mock transaction ID
    const mockTxId = `0.0.${1000000 + Math.floor(Math.random() * 9000000)}@${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000)}`;
    return TransactionId.fromString(mockTxId);
  }
}