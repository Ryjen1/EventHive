import {
  AccountId,
  Client,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Hbar,
  TransactionId,
} from '@hashgraph/sdk'
import { DAppSigner } from '@hashgraph/hedera-wallet-connect'

const CONTRACT_ID_RAW = import.meta.env.VITE_EVENT_REGISTRY_CONTRACT_ID ?? ''

export const DEFAULT_NODE_ACCOUNT_IDS = [
  AccountId.fromString('0.0.3'),
  AccountId.fromString('0.0.4'),
  AccountId.fromString('0.0.5'),
]

const toTinybar = (amount: number): number => {
  return Math.round(amount * 1e8)
}

const fromTinybar = (amount: bigint): number => {
  return Number(amount) / 1e8
}

const ensureContractId = (): ContractId => {
  if (!CONTRACT_ID_RAW) {
    throw new Error('VITE_EVENT_REGISTRY_CONTRACT_ID is not configured')
  }
  return ContractId.fromString(CONTRACT_ID_RAW)
}

const createClient = (): Client => {
  const client = Client.forTestnet()
  return client
}

export const isContractConfigured = (): boolean => CONTRACT_ID_RAW.length > 0

export interface ChainEventRecord {
  id: string
  name: string
  description: string
  date: string
  ticketPrice: number
  maxTickets: number
  coverImage: string | null
  metadataFileId: string | null
  tokenId: string | null
  creatorAccountId: string
  creatorEvmAddress: string
  createdAt: string
  ticketsSold: number
}

const sanitizeOptional = (value: string): string | null => {
  return value && value.trim().length > 0 ? value : null
}

export interface PersistEventPayload {
  id: string
  name: string
  description: string
  date: string
  ticketPrice: number
  maxTickets: number
  coverImage: string | null
  metadataFileId: string | null
  tokenId: string | null
  creatorAccountId: string
  ticketsSold: number
}

export const persistEventOnChain = async (
  payload: PersistEventPayload,
  signer: DAppSigner,
  accountId: string
): Promise<void> => {
  const contractId = ensureContractId()
  const client = createClient()

  try {
    const params = new ContractFunctionParameters()
      .addString(payload.id)
      .addString(payload.name)
      .addString(payload.description)
      .addString(payload.date)
      .addUint256(toTinybar(payload.ticketPrice))
      .addUint256(payload.maxTickets)
      .addString(payload.coverImage ?? '')
      .addString(payload.metadataFileId ?? '')
      .addString(payload.tokenId ?? '')
      .addString(payload.creatorAccountId)
      .addUint256(payload.ticketsSold)

    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction('createOrUpdateEvent', params)
      .setGas(400_000)
      .setMaxTransactionFee(new Hbar(4))
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)

    const frozen = await transaction.freeze()
    const signed = await signer.signTransaction(frozen)
    const response = await signed.execute(client)
    await response.getReceipt(client)
  } finally {
    await client.close()
  }
}

export const updateTicketsSoldOnChain = async (
  id: string,
  ticketsSold: number,
  signer: DAppSigner,
  accountId: string
): Promise<void> => {
  const contractId = ensureContractId()
  const client = createClient()

  try {
    const params = new ContractFunctionParameters().addString(id).addUint256(ticketsSold)

    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction('updateTicketsSold', params)
      .setGas(200_000)
      .setMaxTransactionFee(new Hbar(2))
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)

    const frozen = await transaction.freeze()
    const signed = await signer.signTransaction(frozen)
    const response = await signed.execute(client)
    await response.getReceipt(client)
  } finally {
    await client.close()
  }
}

export const fetchEventsFromChain = async (signer: DAppSigner): Promise<ChainEventRecord[]> => {
  const contractId = ensureContractId()

  const countQuery = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(300_000)
    .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)
    .setMaxQueryPayment(new Hbar(2))
    .setFunction('getEventCount')

  const countResult = await signer.call(countQuery)
  const eventCountBig = countResult.getUint256(0)
  const eventCount = Number(eventCountBig.toString())

  if (eventCount === 0) {
    return []
  }

  const events: ChainEventRecord[] = []

  for (let index = 0; index < eventCount; index++) {
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(500_000)
      .setNodeAccountIds(DEFAULT_NODE_ACCOUNT_IDS)
      .setMaxQueryPayment(new Hbar(4))
      .setFunction('getEventByIndex', new ContractFunctionParameters().addUint256(index))

    const result = await signer.call(query)

    const id = result.getString(0)
    const name = result.getString(1)
    const description = result.getString(2)
    const date = result.getString(3)
    const ticketPriceTinybar = result.getUint256(4)
    const maxTicketsBig = result.getUint256(5)
    const coverImage = result.getString(6)
    const metadataFileId = result.getString(7)
    const tokenId = result.getString(8)
    const creatorEvm = result.getAddress(9)
    const creatorAccountId = result.getString(10)
    const createdAtBig = result.getUint256(11)
    const ticketsSoldBig = result.getUint256(12)

    events.push({
      id,
      name,
      description,
      date,
      ticketPrice: fromTinybar(BigInt(ticketPriceTinybar.toString())),
      maxTickets: Number(maxTicketsBig.toString()),
      coverImage: sanitizeOptional(coverImage),
      metadataFileId: sanitizeOptional(metadataFileId),
      tokenId: sanitizeOptional(tokenId),
      creatorAccountId,
      creatorEvmAddress: creatorEvm,
      createdAt: new Date(Number(createdAtBig.toString()) * 1000).toISOString(),
      ticketsSold: Number(ticketsSoldBig.toString()),
    })
  }

  return events
}
