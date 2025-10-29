# EventHive

EventHive is a decentralized event ticketing platform that revolutionizes how events are managed and tickets are distributed. Built on Hedera Hashgraph, it leverages blockchain technology to create secure, transparent, and immutable NFT-based tickets. Event organizers can create events, mint NFT collections for tickets, and sell them directly to attendees, while users can purchase and own verifiable digital tickets that cannot be duplicated or forged.

## Key Concept

Traditional event ticketing suffers from issues like scalping, fraud, and lack of transparency. EventHive solves these by:

- **NFT Tickets**: Each ticket is a unique non-fungible token (NFT) on Hedera's Token Service, ensuring authenticity and preventing counterfeiting
- **Decentralized Storage**: Event metadata and ticket details are stored on Hedera File Service for permanent, tamper-proof records
- **Smart Contract Registry**: Events are registered on-chain via a Solidity smart contract, providing decentralized persistence and ownership verification
- **Wallet Integration**: Seamless connection via Reown (formerly WalletConnect) for secure Web3 interactions
- **HBAR Payments**: Direct cryptocurrency payments with instant settlement and low fees

The platform empowers event organizers with full control over their events while giving attendees true digital ownership of their tickets, enabling features like secondary market trading and attendance verification.

## Resources

- [Pitch Deck](https://docs.google.com/presentation/d/1bTyweepqXgV3Xl0zZhw_7TK7vFuq2Mn_/edit?usp=sharing&ouid=118201553092943453227&rtpof=true&sd=true)
- [Hedera Certificate](https://drive.google.com/file/d/1v1Mt172-Gy4J836QvbnvinMjqwHcoDwK/view?usp=sharing)

## Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks and functional components
- **TypeScript** - Full type safety and enhanced developer experience
- **Vite** - Fast build tool and development server with hot module replacement
- **React Router** - Client-side routing for single-page application navigation
- **Material-UI (MUI)** - Component library for consistent, accessible UI elements
- **TanStack Query** - Powerful data fetching and state management for server state

### Blockchain & Smart Contracts
- **Hedera Hashgraph** - High-performance distributed ledger technology
- **Hedera SDK** - JavaScript SDK for interacting with Hedera services
- **Solidity** - Smart contract language for the EventRegistry contract
- **Hardhat** - Ethereum development environment (adapted for Hedera)

### Wallet Integration
- **Reown AppKit** - Modern wallet connection library (formerly WalletConnect)
- **HashConnect** - Hedera-specific wallet connection protocol
- **HashPack** - Popular Hedera wallet with built-in support

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting for consistent style
- **TypeScript Compiler** - Type checking and compilation

## Features

- **Create Events**: Launch events and automatically create NFT collections using Hedera Token Service (HTS)
- **Mint Ticket NFTs**: Purchase tickets as unique NFTs with metadata stored on Hedera File Service (HFS)
- **Wallet Integration**: Connect using Reown (formerly WalletConnect) for seamless Web3 experience
- **TypeScript**: Full type safety throughout the application
- **Responsive UI**: Clean, modern interface with dark theme

## Quick Start

### Prerequisites
- **Node.js 18+** and npm (latest LTS recommended)
- **Hedera Testnet Account** with HBAR for testing blockchain operations
- **Web3 Wallet** (HashPack, MetaMask with WalletConnect, or any Reown-compatible wallet)
- **Optional**: Reown project ID for enhanced wallet connection features

### Installation & Setup

#### 1. Clone and Install
```bash
git clone <repository-url>
cd event-ticketing-on-hedera
npm install
```

#### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```bash
# Hedera Testnet Operator Credentials (Required for backend operations)
VITE_HEDERA_OPERATOR_ID=0.0.YOUR_TESTNET_ACCOUNT_ID
VITE_HEDERA_OPERATOR_KEY=your-testnet-private-key

# Optional: Reown Project ID for enhanced wallet connections
VITE_REOWN_PROJECT_ID=your-reown-project-id

# Optional: Smart Contract ID (for full decentralization)
VITE_EVENT_REGISTRY_CONTRACT_ID=0.0.your-contract-id
```

**Getting Hedera Testnet Credentials:**
1. Visit [Hedera Developer Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Fund your account with test HBAR from the faucet
4. Copy your Account ID and Private Key

#### 3. Smart Contract Deployment (Optional but Recommended)
For full decentralization, deploy the EventRegistry smart contract:

```bash
# Install Hardhat if not already installed
npm install -g hardhat

# Navigate to contracts directory
cd contracts

# Compile the contract
npx hardhat compile

# Deploy to testnet (configure your network in hardhat.config.js)
npx hardhat run scripts/deploy.js --network testnet
```

Add the deployed contract ID to your `.env` file as `VITE_EVENT_REGISTRY_CONTRACT_ID`.

#### 4. Start Development Server
```bash
npm run dev
```

#### 5. Access the Application
Open your browser and navigate to `http://localhost:5173`

The application will automatically detect your environment configuration and use either:
- **Full Decentralized Mode**: With smart contract deployed
- **Hybrid Mode**: Smart contract + localStorage backup
- **Development Mode**: localStorage only (for testing without blockchain)

### VS Code Tasks
Use VS Code's task runner (Ctrl+Shift+P → "Tasks: Run Task"):
- **Install Dependencies**: Install all npm packages
- **Start Dev Server**: Launch development server with hot reload
- **Build Production**: Create optimized production build
- **Lint**: Run ESLint to check code quality

## Architecture

### System Overview
EventHive follows a modern decentralized application architecture with clear separation of concerns:

- **Frontend Layer**: React-based SPA handling user interactions and wallet connections
- **Service Layer**: Business logic for event management, NFT operations, and Hedera integration
- **Blockchain Layer**: Smart contracts and direct Hedera service interactions
- **Storage Layer**: Multi-tier persistence (on-chain + localStorage fallback)

### Core Components

#### Frontend Stack
- **React 18** with TypeScript for type-safe UI components
- **Vite** for fast development and optimized production builds
- **React Router** for client-side routing and navigation
- **Material-UI (MUI)** for consistent, accessible component library
- **TanStack Query** for efficient server state management

#### Hedera Integration
- **Hedera SDK**: Direct integration with Hedera Hashgraph network
- **Token Service (HTS)**: Creates and manages NFT collections for events
- **File Service (HFS)**: Stores event metadata and ticket information immutably
- **Account Service**: Handles HBAR payments and transfers
- **Smart Contracts**: Solidity-based EventRegistry for decentralized event storage

#### Wallet Integration
- **Reown AppKit**: Modern wallet connection protocol
- **HashConnect**: Hedera-native wallet connection
- **Multi-wallet Support**: HashPack, MetaMask, and other Web3 wallets

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── HeroSection.tsx   # Landing page hero
│   ├── Navbar.tsx        # Navigation component
│   ├── WalletButton.tsx  # Wallet connection UI
│   └── FeatureCards.tsx  # Feature showcase
├── pages/               # Route-based page components
│   ├── Dashboard.tsx    # User dashboard
│   ├── Events.tsx       # Event listing
│   ├── CreateEvent.tsx  # Event creation form
│   └── EventDetail.tsx  # Individual event view
├── services/            # Business logic and external integrations
│   ├── wallets/         # Wallet connection services
│   │   ├── ReownProvider.tsx
│   │   ├── HashpackProvider.tsx
│   │   └── useWalletInterface.tsx
│   └── hedera/          # Hedera blockchain services
│       ├── hederaService.ts      # Core SDK utilities
│       ├── eventService.ts       # Event management
│       └── eventRegistryClient.ts # Smart contract client
├── AppRouter.tsx        # Route configuration
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
contracts/              # Smart contracts
├── EventRegistry.sol   # Event storage contract
└── scripts/deploy.ts   # Deployment scripts
```

## How It Works

1. **Event Creation**: 
   - Organizer connects wallet and creates event
   - Metadata uploaded to Hedera File Service (HFS)
   - NFT collection created on Hedera Token Service (HTS)

2. **Ticket Purchase**:
   - User connects wallet via Reown
   - Selects event and pays in HBAR
   - Unique NFT ticket minted and transferred to user

3. **Ticket Ownership**:
   - NFTs represent proof of ticket ownership
   - Metadata includes event details and seat information
   - Transferable and resellable on secondary markets

## Event Persistence

EventHive supports multiple levels of persistence for maximum reliability:

### **Option 1: Smart Contract (Full On-Chain) - Recommended**
Events are stored on-chain through the `contracts/EventRegistry.sol` smart contract, providing true decentralization.

1. **Deploy the smart contract:**
   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network testnet
   ```

2. **Configure the frontend** by adding the contract ID to `.env`:
   ```bash
   VITE_EVENT_REGISTRY_CONTRACT_ID=0.0.your_contract_id
   ```

3. **Reconnect your wallet** - the app will automatically sync all events from the blockchain.

### **Option 2: Local Storage (Development/Backup)**
Events are automatically saved to browser localStorage as a fallback. This ensures events persist across page refreshes even without the smart contract.

- ✅ Events persist across browser refreshes
- ✅ Works without smart contract deployment
- ✅ Automatic backup of blockchain events
- ✅ Development-friendly

### **Current Status**
- **Without Contract ID**: Uses localStorage (events persist across refreshes) ✅
- **With Contract ID**: Uses smart contract + localStorage backup (fully decentralized) ✅

Events now persist across page refreshes by default. No more losing your created events when you refresh the browser.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Environment Modes
- **Development**: Uses mock data when Hedera credentials not available
- **Production**: Full Hedera integration with real transactions

## Network Configuration

### Testnet (Default)
- Network: Hedera Testnet
- Get test HBAR: [Hedera Portal](https://portal.hedera.com/)
- Explorer: [HashScan Testnet](https://hashscan.io/testnet)

### Mainnet (Production)
Update `src/services/hedera/hederaService.ts`:
```typescript
// Change from testnet to mainnet
this.client = Client.forMainnet()
```

## Next Steps & Features

### Immediate Improvements
- [ ] Add wallet balance display
- [ ] Implement event browsing and search
- [ ] Add ticket transfer functionality
- [ ] Create admin dashboard for event management

### Advanced Features
- [ ] Secondary ticket marketplace
- [ ] Attendance verification via QR codes
- [ ] Revenue sharing for event organizers
- [ ] Integration with popular calendar apps
- [ ] Multi-signature event approvals
- [ ] Dynamic pricing based on demand

### Technical Enhancements
- [ ] Unit and integration tests
- [ ] GitHub Actions CI/CD pipeline
- [ ] Docker deployment setup
- [ ] Performance optimization
- [ ] Error boundaries and monitoring
- [ ] Offline support with service workers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

Built with love on Hedera Hashgraph
