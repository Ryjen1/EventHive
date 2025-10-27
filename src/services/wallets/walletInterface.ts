import { FileId, TokenId, TransactionId, AccountId } from '@hashgraph/sdk';

export interface NFTCreateOptions {
  name: string;
  symbol: string;
  maxSupply: number;
  metadata: string;
  treasuryAccount: AccountId;
}

export interface NFTMintOptions {
  tokenId: TokenId;
  metadata: Uint8Array[];
  supplyKey?: string;
}

export interface WalletInterface {
  createFile(data: Uint8Array, memo?: string): Promise<FileId>;
  createNFTCollection(options: NFTCreateOptions): Promise<TokenId>;
  mintNFT(options: NFTMintOptions): Promise<TransactionId>;
  transferNonFungibleToken(toAccountId: AccountId, tokenId: TokenId, serialNumber: number): Promise<TransactionId>;
  associateToken(tokenId: TokenId): Promise<TransactionId>;
}