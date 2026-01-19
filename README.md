
# Pokedex PWA - Frontend Engineering Challenge

  

A Progressive Web Application (PWA) built to help Pokémon Trainers track their progress, catch Pokémon, and manage their collection offline.

  

## 🚀 Quick Start

  

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

  

### Installation

```bash

# Clone the repository
git  clone  https://github.com/robertomiguez/pokedex-frontend

# Install dependencies
npm  install

```

### Running the App

```bash

# Start the development server
npm  run  dev

```

Open [http://localhost:5173](http://localhost:5173) in your browser.


### Running Tests

This project uses **Vitest** for unit and component testing.

  

```bash

# Run tests once
npm  test  --  --run

# Run in watch mode
npm  test

```

  

### Build for Production

```bash

# Type-check and build
npm  run  build

```

  

---

  

## 📋 Challenge Requirements vs. Implementation

  

The following table outlines the requirements provided in the challenge and their corresponding implementation status.

  

| Requirement | Status | Implementation Detail |
|------------|:------:|-----------------------|
| **1. See all Pokémon** (names, pics) | ✅ | `AllPokemonView` with Infinite Scroll / Virtualization handled by components |
| **2. Caught Status Indicator** | ✅ | Visual indicators (greyed out / Pokéballs). Logic in `PokemonStore` |
| **3. My Pokédex View** | ✅ | `MyPokedexView` displays only caught Pokémon from IndexedDB |
| **4. Pokémon Details** (Stats, Types, etc.) | ✅ | `PokemonInfoView` shows HP, Speed, Attack, Types, Height, Weight |
| **5. Catch Timestamp** | ✅ | Saved in IndexedDB. Visible in details and used for filtering |
| **6. Share Functionality** | ✅ | Native Web Share API integration in Details view |
| **7. Offline Access (PWA)** | ✅ | Fully offline using Service Workers (Vite PWA) and IndexedDB |
| **8. Progress Overview** | ✅ | Stats bar (count & percentage) in `MyPokedexView` |
| **9. Filter & Sort** | ✅ | Search, Type Filter, Sort (Name / ID), Date Range Filter |
| **10. Bulk Remove** | ✅ | Multi-select (Click / Ctrl+Click) + Context Menu bulk release |
| **11. Notes** | ✅ | Free-text notes per Pokémon via Context Menu |
| **12. View Modes** | ✅ | Grid, List, and Table toggle |
| **13. CSV Export** | ✅ | “Export CSV” button generates caught Pokémon report |
  

---

  

## 🏗 Architecture & Engineering Patterns

  

This codebase follows industry-standard patterns to ensure scalability, maintainability, and testability.

  

### 1. Technology Stack

*  **Framework:** Vue 3 (Composition API, `<script setup>`)

*  **Language:** TypeScript (Strict typing for Domain entities and API responses)

*  **State Management:** Pinia

*  **Build Tool:** Vite

*  **Storage:** IndexedDB (via `idb`)

*  **Testing:** Vitest + Vue Test Utils

  

### 2. Design Patterns

  

#### **Repository Pattern** (`src/storage/repositories`)

Instead of accessing IndexedDB directly in components or stores, we abstract data persistence behind Repositories (`caughtPokemonRepository.ts`).

*  **Benefit:** Decouples the application logic from the specific storage implementation. If we switch to a backend API later, we only change the Repository.

  

#### **Adapter/Mapper Pattern** (`src/services/mappers`)

The API returns data in a specific structure that doesn't always match our Domain Model.

*  **Benefit:** Mappers (`pokemonMapper.ts`) transform external API DTOs into internal Application Entities. This prevents API changes from breaking the UI.

  

#### **Store Pattern (Pinia)** (`src/stores`)

Global state (Caught Pokemon list, Notification system) is managed centrally.

*  **Benefit:** Single source of truth. Reactive state updates propagate instantly across Views (e.g., catching a Pokemon in `AllPokemonView` updates `MyPokedexView` immediately).

  

#### **Atomic/Component-Based Design**

Components are organized by their scope:

*  `ui/`: Generic, reusable components (Modal, DatePicker, Toast).

*  `pokemon/`: Domain-specific components (Cards, Grids).

*  `layout/`: Structural components.

  

### 3. Key Implementations

  

*  **Custom DatePicker:** A scratch-built Vue component (`DatePicker.vue`) providing a modern calendar interface that handles local time correctly and disables future dates, replacing the browser's default date input.

*  **Offline-First Strategy:** The app checks IndexedDB first. It syncs with the PokéAPI only when necessary or requested, ensuring functionality even without internet.

*  **Virtualization/Pagination:** (Implied design) Large lists are handled efficiently to maintain 60fps performance on mobile devices.


---


## 📂 Project Structure

```text
src/
├── components/         # UI components (presentation)
│   ├── common/         # Generic wrappers & layouts
│   ├── pokemon/        # Pokémon-specific UI
│   └── ui/             # Reusable design system
│
├── domain/             # Business entities & contracts
├── services/           # Data access & transformation
│   ├── api/            # HTTP clients
│   └── mappers/        # API → domain mapping
│
├── storage/            # Offline-first persistence
│   └── repositories/  # IndexedDB repositories
│
├── stores/             # Pinia state layer
├── utils/              # Cross-cutting helpers
├── views/              # Route-level views
└── App.vue             # Application bootstrap

```

  

## 🧪 Testing Strategy

  

The project emphasizes testing business logic and complex UI components.

  

*  **Unit Tests (`pokemonFilters.spec.ts`, `pokemonSorting.spec.ts`):** Validate the core logic for searching, filtering, and sorting independently of the UI.

*  **Component Tests (`DatePicker.spec.ts`, `PokemonCard.spec.ts`):** Ensure components render correctly, handle user interactions (clicks, input), and respect props (e.g., disabling future dates).

  

---

  

## 📱 "How to Play"

  

1.  **Browse:** Scroll through the "All Pokemon" list.

2.  **Catch:** Click a Pokemon card or right-click to "Catch".

3.  **Manage:** Go to "My Pokedex".

*  **Filter:** Use the DatePicker to find Pokemon caught on specific days.

*  **Sort:** Organize by Name or ID.

*  **Notes:** Right-click a caught Pokemon to add a personal note.

*  **Release:** Select multiple Pokemon (Ctrl+Click) and Right-Click -> "Release" to remove them.

4.  **Export:** Click "Export CSV" to save your progress.