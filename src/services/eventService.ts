import { TokenId, FileId } from "@hashgraph/sdk";

export interface EventMetadata {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image?: string;
  organizer: string;
  organizerAccountId: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number; // in HBAR
  maxSupply: number;
  currentSupply: number;
}

export interface Event extends EventMetadata {
  ticketTypes: TicketType[];
  tokenId?: TokenId; // The NFT collection token ID
  metadataFileId?: FileId; // File ID where metadata is stored
  isActive: boolean;
  createdAt: string;
}

export interface TicketMetadata {
  eventId: string;
  eventName: string;
  ticketType: string;
  ticketId: string;
  holderAccountId: string;
  purchaseDate: string;
  price: number;
  seatNumber?: string;
  qrCode?: string;
}

export interface UserTicket {
  tokenId: TokenId;
  serialNumber: number;
  metadata: TicketMetadata;
  event: EventMetadata;
}

export class EventService {
  private events: Map<string, Event> = new Map();
  private userTickets: Map<string, UserTicket[]> = new Map(); // accountId -> tickets

  // Create a new event (without blockchain interaction yet)
  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'isActive' | 'tokenId' | 'metadataFileId'>): Event {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event: Event = {
      ...eventData,
      id: eventId,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    this.events.set(eventId, event);
    return event;
  }

  // Get all events
  getAllEvents(): Event[] {
    return Array.from(this.events.values()).filter(event => event.isActive);
  }

  // Get event by ID
  getEvent(eventId: string): Event | undefined {
    return this.events.get(eventId);
  }

  // Get events by organizer
  getEventsByOrganizer(organizerAccountId: string): Event[] {
    return Array.from(this.events.values())
      .filter(event => event.organizerAccountId === organizerAccountId && event.isActive);
  }

  // Update event with blockchain data
  updateEventBlockchainData(eventId: string, tokenId: TokenId, metadataFileId?: FileId): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    event.tokenId = tokenId;
    event.metadataFileId = metadataFileId;
    this.events.set(eventId, event);
    return true;
  }

  // Generate ticket metadata
  generateTicketMetadata(event: Event, ticketType: TicketType, holderAccountId: string): TicketMetadata {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      eventId: event.id,
      eventName: event.name,
      ticketType: ticketType.name,
      ticketId,
      holderAccountId,
      purchaseDate: new Date().toISOString(),
      price: ticketType.price,
      seatNumber: `${ticketType.name.charAt(0)}${ticketType.currentSupply + 1}`,
      qrCode: this.generateQRCode(ticketId, event.id)
    };
  }

  // Generate QR code data for ticket verification
  private generateQRCode(ticketId: string, eventId: string): string {
    return btoa(`${ticketId}:${eventId}:${Date.now()}`);
  }

  // Add ticket to user's collection
  addUserTicket(accountId: string, ticket: UserTicket): void {
    if (!this.userTickets.has(accountId)) {
      this.userTickets.set(accountId, []);
    }
    this.userTickets.get(accountId)!.push(ticket);
  }

  // Get user's tickets
  getUserTickets(accountId: string): UserTicket[] {
    return this.userTickets.get(accountId) || [];
  }

  // Update ticket supply after purchase
  updateTicketSupply(eventId: string, ticketTypeId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    const ticketType = event.ticketTypes.find(tt => tt.id === ticketTypeId);
    if (!ticketType || ticketType.currentSupply >= ticketType.maxSupply) return false;

    ticketType.currentSupply += 1;
    this.events.set(eventId, event);
    return true;
  }

  // Search events
  searchEvents(query: string): Event[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.events.values()).filter(event => 
      event.isActive && (
        event.name.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.venue.toLowerCase().includes(lowercaseQuery) ||
        event.organizer.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Convert event metadata to JSON for file storage
  eventToMetadataJSON(event: Event): string {
    return JSON.stringify({
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      organizer: event.organizer,
      image: event.image,
      ticketTypes: event.ticketTypes
    }, null, 2);
  }

  // Convert ticket metadata to bytes for NFT metadata
  ticketMetadataToBytes(metadata: TicketMetadata): Uint8Array {
    const jsonString = JSON.stringify(metadata);
    return new TextEncoder().encode(jsonString);
  }

  // Create sample events for development
  createSampleEvents(): void {
    const sampleEvents = [
      {
        name: "Blockchain Conference 2024",
        description: "Premier blockchain and cryptocurrency conference featuring industry leaders and innovative workshops.",
        date: "2024-12-15",
        time: "09:00",
        venue: "Tech Convention Center, San Francisco",
        organizer: "CryptoEvents Inc",
        organizerAccountId: "0.0.123456",
        ticketTypes: [
          {
            id: "general",
            name: "General Admission",
            description: "Access to all sessions and networking areas",
            price: 50,
            maxSupply: 500,
            currentSupply: 0
          },
          {
            id: "vip",
            name: "VIP Pass",
            description: "Premium access with exclusive networking and lunch",
            price: 150,
            maxSupply: 100,
            currentSupply: 0
          }
        ]
      },
      {
        name: "Music Festival Summer 2024",
        description: "Three-day music festival featuring top artists from around the world.",
        date: "2024-07-20",
        time: "12:00",
        venue: "Central Park Amphitheater",
        organizer: "LiveMusic Productions",
        organizerAccountId: "0.0.789012",
        ticketTypes: [
          {
            id: "day_pass",
            name: "Single Day Pass",
            description: "Access for one day of the festival",
            price: 75,
            maxSupply: 1000,
            currentSupply: 0
          },
          {
            id: "weekend_pass",
            name: "Full Weekend Pass",
            description: "Access to all three days of the festival",
            price: 200,
            maxSupply: 600,
            currentSupply: 0
          }
        ]
      }
    ];

    sampleEvents.forEach(eventData => {
      this.createEvent(eventData);
    });
  }
}

// Singleton instance
export const eventService = new EventService();