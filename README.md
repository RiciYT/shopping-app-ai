# Shopping App AI

A smart cross-platform shopping list app built with React Native (Expo), similar to Bring. Track your groceries, manage multiple shopping lists, and keep your shopping organized.

## Features

### Core Features
- **Home Screen**: Overview of all shopping lists with quick stats
- **Shopping List Screen**: Add, remove, and check off items with category organization
- **Product Details Screen**: View and edit product information including prices and notes
- **History Screen**: View completed shopping trips and spending summary
- **Settings Screen**: Customize app preferences

### State Management
- Context API for global state management
- Local storage sync with AsyncStorage
- Automatic data persistence

### Price Tracking Structure
- Simple price tracking per product
- Total calculation for shopping lists
- Price history infrastructure (placeholder for future)

### Placeholder Components for Future Features
- **Price History**: Track price changes over time
- **Budget View**: Set monthly budgets and track spending
- **Multi-User Sync**: Share lists with family and friends

## Tech Stack

- **React Native** with **Expo SDK 54**
- **TypeScript** for type safety
- **React Navigation** (Bottom Tabs + Native Stack)
- **AsyncStorage** for local persistence
- **Expo Vector Icons** for UI icons

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## Project Structure

```
├── App.tsx                 # Main app entry point
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── placeholders/   # Future feature placeholders
│   │   ├── AddProductModal.tsx
│   │   ├── ListCard.tsx
│   │   └── ProductItem.tsx
│   ├── context/            # State management
│   │   └── AppContext.tsx
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── ShoppingListScreen.tsx
│   │   ├── ProductDetailsScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── storage/            # AsyncStorage utilities
│   │   └── index.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Helper utilities
│       └── index.ts
├── assets/                 # App icons and splash screen
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## Screens

### Home
- List of active shopping lists
- Quick stats (active lists, total items, estimated cost)
- Create new lists
- Access to future features (budget, multi-user sync)

### Shopping List
- Add items with category, quantity, unit, and optional price
- Check off items as you shop
- Progress bar showing completion
- Grouped by category for easy navigation

### Product Details
- View and edit product information
- Price per unit and total calculation
- Notes for specific preferences
- Price history placeholder

### History
- Completed shopping trips
- Summary statistics (trips, items, total spent)
- Clear history option

### Settings
- Dark mode toggle
- Currency selection
- Default unit preference
- Feature toggles (notifications, price tracking, budget alerts)
- Clear all data option

## Future Roadmap

- [ ] Price history charts
- [ ] Monthly budget tracking
- [ ] Multi-user sync with cloud backend
- [ ] Smart suggestions based on history
- [ ] Barcode scanning
- [ ] Store price comparison
- [ ] Recipe integration

## License

MIT
