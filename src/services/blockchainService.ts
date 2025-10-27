import { TokenId, FileId, AccountId } from "@hashgraph/sdk";
import { WalletInterface, NFTCreateOptions, NFTMintOptions } from "./wallets/walletInterface";
import { Event, eventService } from "./eventService";

export class BlockchainService {
  constructor(private walletInterface: WalletInterface, private accountId: AccountId) {}

  // Deploy NFT collection for an event
  async deployEventNFTCollection(event: Event): Promise<{ tokenId: TokenId; metadataFileId?: FileId } | null> {
    try {
      // First, create metadata file on Hedera File Service
      const eventMetadataJSON = eventService.eventToMetadataJSON(event);
      const metadataBytes = new TextEncoder().encode(eventMetadataJSON);
      
      const metadataFileId = await this.walletInterface.createFile(
        metadataBytes
      );

      // Create NFT collection
      const nftOptions: NFTCreateOptions = {
        name: `${event.name} Tickets`,
        symbol: `${event.name.replace(/\s+/g, '').substring(0, 6).toUpperCase()}TIX`,
        maxSupply: event.ticketTypes.reduce((sum, tt) => sum + tt.maxSupply, 0),
        treasuryAccount: this.accountId,
        metadata: metadataFileId?.toString()
      };

      const tokenId = await this.walletInterface.createNFTCollection(nftOptions);

      if (tokenId) {
        // Update the event with blockchain data
        eventService.updateEventBlockchainData(event.id, tokenId, metadataFileId || undefined);
        return { tokenId, metadataFileId: metadataFileId || undefined };
      }

      return null;
    } catch (error) {
      console.error("Error deploying event NFT collection:", error);
      return null;
    }
  }

  // Purchase a ticket (mint NFT)
  async purchaseTicket(
    eventId: string, 
    ticketTypeId: string, 
    buyerAccountId: AccountId
  ): Promise<{ success: boolean; transactionId?: string; serialNumber?: number }> {
    try {
      const event = eventService.getEvent(eventId);
      if (!event || !event.tokenId) {
        throw new Error("Event not found or not deployed on blockchain");
      }

      const ticketType = event.ticketTypes.find(tt => tt.id === ticketTypeId);
      if (!ticketType) {
        throw new Error("Ticket type not found");
      }

      if (ticketType.currentSupply >= ticketType.maxSupply) {
        throw new Error("Ticket type sold out");
      }

      // Generate ticket metadata
      const ticketMetadata = eventService.generateTicketMetadata(
        event, 
        ticketType, 
        buyerAccountId.toString()
      );

      // Convert metadata to bytes
      const metadataBytes = eventService.ticketMetadataToBytes(ticketMetadata);

      // Mint NFT ticket
      const mintOptions: NFTMintOptions = {
        tokenId: event.tokenId,
        metadata: [metadataBytes]
      };

      const transactionId = await this.walletInterface.mintNFT(mintOptions);

      if (transactionId) {
        // Update ticket supply
        eventService.updateTicketSupply(eventId, ticketTypeId);

        // Add ticket to user's collection
        const userTicket = {
          tokenId: event.tokenId,
          serialNumber: ticketType.currentSupply, // This would be the actual serial number from the transaction
          metadata: ticketMetadata,
          event: {
            id: event.id,
            name: event.name,
            description: event.description,
            date: event.date,
            time: event.time,
            venue: event.venue,
            image: event.image,
            organizer: event.organizer,
            organizerAccountId: event.organizerAccountId
          }
        };

        eventService.addUserTicket(buyerAccountId.toString(), userTicket);

        return { 
          success: true, 
          transactionId: transactionId.toString(), 
          serialNumber: ticketType.currentSupply 
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      return { success: false };
    }
  }

  // Transfer ticket to another user
  async transferTicket(
    tokenId: TokenId,
    serialNumber: number,
    toAccountId: AccountId
  ): Promise<{ success: boolean; transactionId?: string }> {
    try {
      const transactionId = await this.walletInterface.transferNonFungibleToken(
        toAccountId,
        tokenId,
        serialNumber
      );

      if (transactionId) {
        return { success: true, transactionId: transactionId.toString() };
      }

      return { success: false };
    } catch (error) {
      console.error("Error transferring ticket:", error);
      return { success: false };
    }
  }

  // Associate token with user's account (required before receiving NFTs)
  async associateToken(tokenId: TokenId): Promise<{ success: boolean; transactionId?: string }> {
    try {
      const transactionId = await this.walletInterface.associateToken(tokenId);

      if (transactionId) {
        return { success: true, transactionId: transactionId.toString() };
      }

      return { success: false };
    } catch (error) {
      console.error("Error associating token:", error);
      return { success: false };
    }
  }

  // Get blockchain network information
  getNetworkInfo() {
    return {
      network: 'testnet', // This should come from config
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com'
    };
  }

  // Utility function to create blockchain service instance
  static create(walletInterface: WalletInterface, accountId: string): BlockchainService {
    return new BlockchainService(walletInterface, AccountId.fromString(accountId));
  }
}

export default BlockchainService;