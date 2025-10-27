# 🎟️ EventHive

A decentralized event ticketing platform built on Hedera Hashgraph using React, TypeScript, and Reown wallet connection.

## ✨ Features

- **Create Events**: Launch events and automatically create NFT collections using Hedera Token Service (HTS)
- **Mint Ticket NFTs**: Purchase tickets as unique NFTs with metadata stored on Hedera File Service (HFS)
- **Wallet Integration**: Connect using Reown (formerly WalletConnect) for seamless Web3 experience
- **TypeScript**: Full type safety throughout the application
- **Responsive UI**: Clean, modern interface with dark theme

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Hedera testnet account with HBAR for testing
- Optional: A Reown project ID for wallet connections

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```bash
   # Hedera testnet credentials (for backend operations)
   VITE_HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   VITE_HEDERA_OPERATOR_KEY=your-private-key-here
   
   # Optional: Your Reown project ID
   VITE_REOWN_PROJECT_ID=your-reown-project-id
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see the app

### VS Code Tasks
Use VS Code's task runner (Ctrl+Shift+P → "Tasks: Run Task"):
- **Install Dependencies**: Install all npm packages
- **Start Dev Server**: Launch development server with hot reload
- **Build Production**: Create optimized production build
- **Lint**: Run ESLint to check code quality

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for UI components
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Reown AppKit** for wallet connections

### Hedera Integration
- **Hedera SDK**: Direct integration with Hedera Hashgraph
- **Token Service (HTS)**: Create NFT collections for events
- **File Service (HFS)**: Store event and ticket metadata
- **Account Service**: Handle HBAR payments and transfers

### Project Structure
```
src/
├── services/
│   ├── wallets/
│   │   └── ReownProvider.tsx     # Wallet connection logic
│   └── hedera/
│       ├── eventService.ts       # Event creation & NFT minting
│       └── hederaService.ts      # Core Hedera SDK utilities
├── AppRouter.tsx                 # Route definitions
├── App.tsx                       # Main app component
└── main.tsx                      # Entry point
```

## 🎫 How It Works

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

## 🗄️ Event Persistence

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

**🎉 Events now persist across page refreshes by default!** No more losing your created events when you refresh the browser.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Environment Modes
- **Development**: Uses mock data when Hedera credentials not available
- **Production**: Full Hedera integration with real transactions

## 🌐 Network Configuration

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

## 🔮 Next Steps & Features

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ on Hedera Hashgraph
# EventHive
