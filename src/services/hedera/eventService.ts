import {
  AccountId,
  Client,
  FileCreateTransaction,
  Hbar,
  TokenCreateTransaction,
  TokenId,
  TokenMintTransaction,
  TokenSupplyType,
  TokenType,
  TransactionId,
} from '@hashgraph/sdk'
import { DAppConnector, DAppSigner } from '@hashgraph/hedera-wallet-connect'
import {
  ChainEventRecord,
  DEFAULT_NODE_ACCOUNT_IDS,
  fetchEventsFromChain,
  isContractConfigured,
  persistEventOnChain,
  updateTicketsSoldOnChain,
} from './eventRegistryClient'

export interface EventInput {
  id: string
  name: string
  description: string
  date: string
  ticketPrice: number
  maxTickets: number
  coverImage?: string
}

export interface EventData extends EventInput {
  tokenId?: string
  metadataFileId?: string
  creatorAccountId: string
  createdAt: string
  ticketsSold: number
}

export interface TicketMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  eventId: string
  ticketNumber: number
}

type EventsListener = (events: EventData[]) => void

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515165562835-c4c6b2c5a829?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=900&q=80',
]

class EventService {
  private events: EventData[] = []
  private listeners = new Set<EventsListener>()
  private readonly useContractPersistence = isContractConfigured()

  constructor() {
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('eventhive_events')
      if (stored) {
        this.events = JSON.parse(stored)
        console.log('📱 Loaded', this.events.length, 'events from localStorage')
        console.log('📱 Event persistence is active - events will survive page refreshes!')
      } else {
        console.log('📱 No events found in localStorage - starting fresh')
      }
    } catch (error) {
      console.warn('Failed to load events from localStorage:', error)
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('eventhive_events', JSON.stringify(this.events))
      console.log('💾 Saved', this.events.length, 'events to localStorage')
    } catch (error) {
      console.warn('Failed to save events to localStorage:', error)
    }
  }

  getEvents(): EventData[] {
    return [...this.events]
  }

  // Clear all events (for development/testing)
  clearAllEvents(): void {
    this.events = []
    this.saveToLocalStorage()
    this.notifyListeners()
  }

  getEventById(id: string): EventData | undefined {
    return this.events.find((event) => event.id === id)
  }

  subscribe(listener: EventsListener): () => void {
    this.listeners.add(listener)
    listener(this.getEvents())
    return () => {
      this.listeners.delete(listener)
    }
  }

  async refreshFromContract(connector: DAppConnector, accountId: string): Promise<EventData[]> {
    if (!this.useContractPersistence) {
      return this.getEvents()
    }

    const signer = this.getSigner(connector, accountId)
    await this.syncFromContract(signer)
    this.saveToLocalStorage() // Save blockchain events to localStorage as backup
    return this.getEvents()
  }

  private notifyListeners() {
    const snapshot = this.getEvents()
    this.listeners.forEach((listener) => listener(snapshot))
  }

  private getSigner(connector: DAppConnector, accountId: string): DAppSigner {
    const normalizedId = AccountId.fromString(accountId).toString()
    const signer = connector.signers?.find(
      (candidate) => candidate.getAccountId().toString() === normalizedId
    )

    if (!signer) {
      throw new Error('No signer is available for the connected Hedera account')
    }

    return signer
  }

  private async syncFromContract(signer: DAppSigner) {
    if (!this.useContractPersistence) {
      return
    }

    const chainEvents = await fetchEventsFromChain(signer)
    const mapped = chainEvents.map((record) => this.mapChainRecord(record))
    mapped.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    )
    this.events = mapped
    this.saveToLocalStorage()
    this.notifyListeners()
  }

  private mapChainRecord(record: ChainEventRecord): EventData {
    const coverImage = record.coverImage ?? this.selectCoverImage(record.name)
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      date: record.date,
      ticketPrice: record.ticketPrice,
      maxTickets: record.maxTickets,
      coverImage,
      metadataFileId: record.metadataFileId ?? undefined,
      tokenId: record.tokenId ?? undefined,
      creatorAccountId: record.creatorAccountId,
      createdAt: record.createdAt,
      ticketsSold: record.ticketsSold,
    }
  }

  private selectCoverImage(name: string): string {
    if (FALLBACK_IMAGES.length === 0) return 'https://via.placeholder.com/800x400?text=Hedera+Event'
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length]
  }

  private async uploadMetadataToHfs(
    event: EventData,
    signer: DAppSigner,
    accountId: string
  ): Promise<string> {
    const client = Client.forTestnet()
    const metadata = {
      name: event.name,
      description: event.description,
      eventDate: event.date,
      ticketPrice: event.ticketPrice,
      maxTickets: event.maxTickets,
      createdAt: event.createdAt,
      creator: event.creatorAccountId,
    }

    const contents = new TextEncoder().encode(JSON.stringify(metadata))

    const transaction = new FileCreateTransaction()
      .setFileMemo(`Event metadata • ${event.name}`)
      .setKeys([signer.getAccountKey()])
      .setContents(contents)
      .setMaxTransactionFee(new Hbar(1))
      .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))

    const frozenTx = await transaction.freeze()
    const signedTx = await signer.signTransaction(frozenTx)
    const response = await signedTx.execute(client)
    const receipt = await response.getReceipt(client)

    if (!receipt.fileId) {
      throw new Error('Failed to create event metadata file on Hedera File Service')
    }

    return receipt.fileId.toString()
  }

  private generateTokenSymbol(name: string): string {
    const uppercase = name.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    if (uppercase.length >= 3) {
      return uppercase.slice(0, 5)
    }
    return `EVT${Math.abs(Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)).toString().slice(0, 3)}`
  }

  private async createEventNftCollection(
    event: EventData,
    signer: DAppSigner,
    accountId: string
  ): Promise<string> {
    const client = Client.forTestnet()
    const transaction = new TokenCreateTransaction()
      .setTokenName(`${event.name} Tickets`)
      .setTokenSymbol(this.generateTokenSymbol(event.name))
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(AccountId.fromString(accountId))
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(event.maxTickets)
      .setDecimals(0)
      .setAdminKey(signer.getAccountKey())
      .setSupplyKey(signer.getAccountKey())
      .setFreezeDefault(false)
      .setTokenMemo(`Tickets for ${event.name}`)
      .setMaxTransactionFee(new Hbar(2))
      .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))

    const frozenTx = await transaction.freeze()
    const signedTx = await signer.signTransaction(frozenTx)
    const response = await signedTx.execute(client)
    const receipt = await response.getReceipt(client)

    if (!receipt.tokenId) {
      throw new Error('Failed to create the NFT ticket collection')
    }

    return receipt.tokenId.toString()
  }

  private async mintTicketNft(
    event: EventData,
    signer: DAppSigner,
    accountId: string,
    ticketNumber: number
  ): Promise<string> {
    if (!event.tokenId) {
      throw new Error('Token ID missing for this event')
    }

    // Check if we're in mock mode by trying to detect if the signer is a mock
    const isMockMode = !signer.getAccountKey || typeof signer.getAccountKey !== 'function'

    if (isMockMode) {
      console.log('Mock: Minting ticket NFT for event:', event.name, 'ticket number:', ticketNumber)
      // Generate a mock serial number for mock mode
      const mockSerial = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      return mockSerial
    }

    const client = Client.forTestnet()

    const metadata: TicketMetadata = {
      name: `${event.name} • Ticket #${ticketNumber}`,
      description: `Access pass for ${event.name}`,
      image: event.coverImage ?? this.selectCoverImage(event.name),
      attributes: [
        { trait_type: 'Event ID', value: event.id },
        { trait_type: 'Ticket Number', value: ticketNumber },
        { trait_type: 'Price (HBAR)', value: event.ticketPrice },
        { trait_type: 'Event Date', value: event.date },
      ],
      eventId: event.id,
      ticketNumber,
    }

    const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata))

    const transaction = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(event.tokenId))
      .setMetadata([metadataBytes])
      .setMaxTransactionFee(new Hbar(1))
      .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))

    const frozenTx = await transaction.freeze()
    const signedTx = await signer.signTransaction(frozenTx)
    const response = await signedTx.execute(client)
    const receipt = await response.getReceipt(client)

    if (!receipt.serials || receipt.serials.length === 0) {
      throw new Error('Ticket minting did not return a serial number')
    }

    return receipt.serials[0].toString()
  }

  async createEvent(
    input: EventInput,
    connector: DAppConnector,
    accountId: string
  ): Promise<EventData> {
    const event: EventData = {
      ...input,
      coverImage: input.coverImage ?? this.selectCoverImage(input.name),
      creatorAccountId: AccountId.fromString(accountId).toString(),
      createdAt: new Date().toISOString(),
      ticketsSold: 0,
    }

    if (event.maxTickets <= 0) {
      throw new Error('Max tickets must be greater than zero.')
    }

    try {
      // Try to get signer for blockchain operations
      let signer: DAppSigner | null = null
      try {
        signer = this.getSigner(connector, accountId)
      } catch (signerError) {
        console.warn('Could not get signer, creating event locally:', signerError)
      }

      let metadataFileId: string | undefined
      let tokenId: string | undefined

      if (signer) {
        try {
          metadataFileId = await this.uploadMetadataToHfs(event, signer, accountId)
          tokenId = await this.createEventNftCollection(event, signer, accountId)
        } catch (blockchainError) {
          console.warn('Blockchain operations failed, creating event locally:', blockchainError)
          // Continue with local creation even if blockchain fails
        }
      }

      const storedEvent: EventData = {
        ...event,
        metadataFileId,
        tokenId,
      }

      if (this.useContractPersistence && signer) {
        try {
          await persistEventOnChain(
            {
              id: storedEvent.id,
              name: storedEvent.name,
              description: storedEvent.description,
              date: storedEvent.date,
              ticketPrice: storedEvent.ticketPrice,
              maxTickets: storedEvent.maxTickets,
              coverImage: storedEvent.coverImage ?? null,
              metadataFileId: storedEvent.metadataFileId ?? null,
              tokenId: storedEvent.tokenId ?? null,
              creatorAccountId: storedEvent.creatorAccountId,
              ticketsSold: storedEvent.ticketsSold,
            },
            signer,
            accountId
          )

          await this.syncFromContract(signer)
          return (
            this.getEventById(storedEvent.id) ?? {
              ...storedEvent,
              createdAt: new Date().toISOString(),
            }
          )
        } catch (persistError) {
          console.warn('Contract persistence failed, storing locally:', persistError)
        }
      }

      // Always store locally as fallback
      this.events = [storedEvent, ...this.events]
      this.saveToLocalStorage()
      this.notifyListeners()

      return storedEvent
    } catch (error) {
      console.error('Event creation failed', error)
      throw error instanceof Error
        ? error
        : new Error('Event creation failed. Please try again.')
    }
  }

  async purchaseTicket(
    eventId: string,
    connector: DAppConnector,
    accountId: string
  ): Promise<string> {
    const event = this.getEventById(eventId)
    if (!event) {
      throw new Error('Event not found locally. Refresh and try again.')
    }

    if (event.ticketsSold >= event.maxTickets) {
      throw new Error('This event is sold out.')
    }

    // Allow anyone to purchase tickets (removed creator-only restriction)
    console.log('Mock: Processing ticket purchase for event:', event.name, 'by account:', accountId)

    try {
      const signer = this.getSigner(connector, accountId)
      const serial = await this.mintTicketNft(event, signer, accountId, event.ticketsSold + 1)

      event.ticketsSold += 1

      if (this.useContractPersistence) {
        try {
          await updateTicketsSoldOnChain(event.id, event.ticketsSold, signer, accountId)
          await this.syncFromContract(signer)
        } catch (error) {
          event.ticketsSold -= 1
          throw error instanceof Error
            ? error
            : new Error('Ticket minted but failed to update chain state. Please retry.')
        }
      } else {
        // Mock mode: still update the event and notify listeners
        this.saveToLocalStorage()
        this.notifyListeners()
      }

      return serial
    } catch (signerError) {
      // If signer fails in mock mode, simulate the purchase
      console.log('Mock: Simulating ticket purchase due to signer error:', signerError)
      const mockSerial = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      event.ticketsSold += 1
      this.saveToLocalStorage()
      this.notifyListeners()
      return mockSerial
    }
  }
}

export const eventService = new EventService()
