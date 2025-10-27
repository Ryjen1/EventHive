# Hedera Event Ticketing Platform

A fully decentralized event ticketing platform built on the Hedera Network using React, TypeScript, and the Hedera SDK. This platform enables users to create events and sell blockchain-powered NFT tickets with fraud-proof security.

## Features

### 🎫 Event Creation
- Create events with detailed information (name, date, venue, description)
- Define multiple ticket types with different pricing and supply limits
- Deploy events as NFT collections on Hedera blockchain
- Store event metadata on Hedera File Service (HFS)

### 🔐 Blockchain Security
- Each event is an NFT collection (TokenType.NON_FUNGIBLE_UNIQUE)
- Each ticket is a unique NFT with embedded metadata
- Fraud-proof and tamper-resistant tickets
- Transparent supply and ownership tracking

### 💳 Wallet Integration
- MetaMask support for Hedera network (limited HTS functionality)
- WalletConnect integration for full Hedera SDK support
- Seamless transaction signing and execution

**Important Note:** MetaMask has limitations with Hedera Token Service operations. For full event creation and NFT deployment capabilities, use WalletConnect-compatible wallets.

### 🎟️ Ticket Management
- Purchase tickets (mint NFTs) directly to your wallet
- View owned tickets in personal dashboard
- Transfer tickets to other users
- QR codes for event entry verification

### 🎭 Event Discovery
- Browse all available events
- Search and filter functionality
- Real-time availability tracking
- Event organizer profiles

## Technical Architecture

### Hedera Integration
- **Hedera Token Service (HTS)**: Creates NFT collections for events
- **TokenCreateTransaction**: Deploys new NFT collections
- **TokenMintTransaction**: Mints individual ticket NFTs
- **TransferTransaction**: Handles ticket transfers between users
- **Hedera File Service**: Stores event and ticket metadata

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Blockchain SDK**: @hashgraph/sdk
- **Wallet Connection**: @hashgraph/hedera-wallet-connect
- **Routing**: React Router DOM
- **State Management**: React Context + Hooks

### Project Structure
```
src/
├── components/
│   ├── Navbar.tsx              # Navigation with wallet connection
│   ├── Footer.tsx              # App footer
│   └── WalletSelectionDialog.tsx
├── pages/
│   ├── Home.tsx                # Landing page
│   ├── Events.tsx              # Event listing and search
│   ├── EventDetail.tsx         # Event details and ticket purchase
│   ├── CreateEvent.tsx         # Event creation form
│   └── Dashboard.tsx           # User dashboard
├── services/
│   ├── eventService.ts         # Event management logic
│   ├── blockchainService.ts    # Hedera blockchain operations
│   └── wallets/                # Wallet integration
│       ├── walletInterface.ts  # Common wallet interface
│       ├── metamask/           # MetaMask integration
│       └── walletconnect/      # WalletConnect integration
├── contexts/
│   ├── MetamaskContext.tsx     # MetaMask state management
│   └── WalletConnectContext.tsx # WalletConnect state management
└── config/
    ├── constants.ts            # Gas limits and constants
    ├── networks.ts             # Network configurations
    └── types.ts                # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- A Hedera testnet account
- MetaMask browser extension or WalletConnect-compatible wallet

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Wallet Setup
1. **MetaMask**: Add Hedera testnet network:
   - Network Name: Hedera (testnet)
   - RPC URL: https://testnet.hashio.io/api
   - Chain ID: 0x128
   - Currency Symbol: HBAR
   - **Limitations**: Cannot create NFT collections or files (HTS/HFS operations)
   - **Capabilities**: View events, purchase existing tickets, transfer tokens

2. **WalletConnect**: Use any WalletConnect-compatible wallet with Hedera support
   - **Full Functionality**: Complete HTS and HFS support
   - **Recommended for**: Event creation, NFT collection deployment

## Usage Guide

### For Event Organizers
1. **Connect Wallet**: Use MetaMask or WalletConnect
2. **Create Event**: 
   - Fill in event details (name, date, venue, description)
   - Define ticket types with pricing and supply limits
   - Choose to deploy immediately or save locally
3. **Deploy to Blockchain**: Creates NFT collection on Hedera
4. **Manage Event**: View sales, revenue, and ticket holders in dashboard

### For Event Attendees
1. **Browse Events**: Explore available events with search and filtering
2. **View Event Details**: See event information, venue, and ticket options
3. **Purchase Tickets**: 
   - Connect wallet and associate with event token
   - Select ticket type and confirm purchase
   - Receive NFT ticket in wallet
4. **Manage Tickets**: View owned tickets in dashboard, transfer if needed

## Key Components

### Event Service (`eventService.ts`)
- Manages event creation, storage, and retrieval
- Handles ticket metadata generation
- Provides search and filtering capabilities
- Maintains user ticket collections

### Blockchain Service (`blockchainService.ts`)
- Interfaces with Hedera SDK for blockchain operations
- Handles NFT collection deployment
- Manages ticket minting and transfers
- Provides network utilities

### Wallet Interface (`walletInterface.ts`)
- Unified interface for different wallet providers
- Supports MetaMask and WalletConnect
- Handles transaction signing and execution
- Manages token associations and transfers

## Smart Contract Integration

This platform uses Hedera's native token services instead of smart contracts:
- **HTS (Hedera Token Service)**: Built-in NFT functionality
- **HFS (Hedera File Service)**: Metadata storage
- **Native Transactions**: Direct blockchain interactions without gas fees

## Security Features

### Fraud Prevention
- Unique NFT serial numbers prevent duplication
- Blockchain verification for all tickets
- Immutable event and ticket metadata
- Transparent ownership tracking

### User Safety
- Non-custodial wallet integration
- Client-side transaction signing
- No private key storage
- User controls all assets

## Network Configuration

Currently configured for Hedera testnet:
- **Network**: Hedera Testnet
- **Chain ID**: 0x128 (296)
- **RPC URL**: https://testnet.hashio.io/api
- **Mirror Node**: https://testnet.mirrornode.hedera.com

## Environment Variables

Create a `.env` file for configuration:
```env
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_project_id
REACT_APP_HEDERA_NETWORK=testnet
```

## Development

### Adding New Features
1. Update interfaces in `walletInterface.ts` if blockchain operations are needed
2. Implement in both MetaMask and WalletConnect clients
3. Add business logic to relevant service files
4. Create or update UI components
5. Add routes if new pages are needed

### Testing
- Test with both MetaMask and WalletConnect
- Verify on Hedera testnet before mainnet deployment
- Test event creation, ticket purchase, and transfer flows

## Deployment

### Production Deployment
1. Update network configuration for mainnet
2. Build for production:
   ```bash
   npm run build
   ```
3. Deploy to hosting service (Netlify, Vercel, etc.)
4. Configure environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the existing code style
4. Test thoroughly on testnet
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For technical questions or issues:
- Check the [Hedera documentation](https://docs.hedera.com)
- Review the [Hedera SDK documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- Open an issue in the repository

---

**Built with ❤️ on Hedera - The most used, sustainable, enterprise-grade public network for the decentralized economy.**