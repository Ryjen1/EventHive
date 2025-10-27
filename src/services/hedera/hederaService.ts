import { Client, TokenCreateTransaction, AccountId, TokenType, TokenSupplyType, PrivateKey, FileCreateTransaction } from '@hashgraph/sdk'

export const createClientForTestnet = (): Client => {
  // Instruct the user to set env vars; for now return a placeholder client
  // To use this locally, set HEDERA_TESTNET_OPERATOR_ID and HEDERA_TESTNET_OPERATOR_KEY
  const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID
  const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY

  if (!operatorId || !operatorKey) {
    throw new Error('Set HEDERA_TESTNET_OPERATOR_ID and HEDERA_TESTNET_OPERATOR_KEY')
  }

  const client = Client.forTestnet()
  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey))
  return client
}

export const uploadMetadataToHFS = async (client: Client, json: object) => {
  const data = Buffer.from(JSON.stringify(json))
  const tx = new FileCreateTransaction().setContents(data)
  const resp = await tx.execute(client)
  const receipt = await resp.getReceipt(client)
  return receipt.fileId?.toString() || null
}

export const createNftCollection = async (client: Client, name: string, symbol: string, treasury: AccountId) => {
  const tx = new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTreasuryAccountId(treasury)
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)

  const resp = await tx.execute(client)
  const receipt = await resp.getReceipt(client)
  return receipt.tokenId?.toString() || null
}
