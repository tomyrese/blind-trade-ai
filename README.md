# PokéMarket - Blind Trade & AI Valuation App

PokéMarket is a premium React Native mobile application designed for Pokémon Card collectors and traders. It mimics a high-end marketplace with features like blind box trading ("Trade Up"), AI-powered card scanning/valuation, and real-time market data visualization.

## 🌟 Key Features

### 1. Market Dashboard (Trang Chủ)

- **Live Market Feed**: Real-time ticker of card prices, trends, and "Hot" items.
- **Advanced Search**: Instant search with Vietnamese Telex/VNI support.
- **FlashList Grid**: Optimized 60fps scrolling performance for massive card lists.
- **Rarity Glows**: Dynamic visual effects (Neon Blue, Purple, Gold) based on card rarity.

### 2. AI Scanner & Chat (Poké-AI)

- **AI Assistant**: A chatbot capable of answering questions about card prices, rarity, and investment advice.
- **Visual Recognition**: (Planned) Scan physical cards to identify and value them.
- **Contextual Awareness**: Remembers conversation history for natural dialogue.

### 3. Portfolio Management (Bộ Sưu Tập)

- **Inventory Tracking**: Manage your card collection with valuation tracking.
- **Virtual Account**: Includes a "Demo Mode" to seed your portfolio with test cards.
- **Total Value**: Real-time calculation of your collection's net worth.

### 4. Trade Up / Blind Box (Hợp Nhất)

- **Gamified Trading**: Combine lower-rarity cards for a chance to win Legendary cards.
- **Lootbox Animation**: Exciting reveal animations with particle effects and feedback.

### 5. Trainer Profile & VIP (Hồ Sơ Trainer)

- **Rank System**: Level up your trainer rank from Rookie to Master based on collection value and activity.
- **VIP Membership**: Subscribers get exclusive perks, gold/platinum avatar frames, and bonus XP.
- **Stats Overview**: Track your Pokedex progress and collection stats.

## 🛠 Tech Stack

- **Core**: React Native (0.76+), TypeScript
- **State Management**: Zustand (Persistence via MMKV)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Styling**: NativeWind (TailwindCSS for RN) + Reanimated 3
- **Performance**: @shopify/flash-list, React.memo optimization
- **AI/Backend Integration**: Custom Hook architecture (Mocked for Demo)

## 🚀 Getting Started

### Prerequisites

- Node.js v24.12.0
- npm 11.6.2
- JDK 21
- Android Studio / Xcode

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/tomyrese/blind-trade-ai.git
   cd blind-trade-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the application**

   ```bash
   # Android
   npm run android
   ```

## 📱 Developer Notes

### Virtual Account Setup

To populate your portfolio with test data:

1. Go to the **Trainer** tab.
2. The `usePortfolioStore` exposes a `seedPortfolio()` action (triggered automatically in demo mode).

### Folder Structure

- `src/presentation`: UI Layer (Screens, Components)
- `src/domain`: Business Logic (Models)
- `src/data`: API Repositories (Mocked)
- `src/shared`: Utilities, Stores, Hooks

---

_Built with ❤️ for Pokémon TCG Fans._
