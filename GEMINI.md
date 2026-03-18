# Project Overview

This is a Nuxt 3 application built with Vue.js and TypeScript. It appears to function as a storefront or content display platform, interacting with a headless WordPress backend via GraphQL. The application integrates state management using Pinia, and its styling is handled by Tailwind CSS. Key features include product/post display, a shopping cart, favorites management

**Key Technologies:**
*   **Framework:** Nuxt 3 (Vue.js)
*   **Language:** TypeScript
*   **State Management:** Pinia
*   **Styling:** Tailwind CSS
*   **UI Components:** Nuxt Swiper (for carousels)
*   **Backend:** WordPress (headless, accessed via GraphQL)
*   **Emailing:** Nodemailer (server-side)

*   **DevTools:** Nuxt Devtools

# Building and Running

## Setup

Install the project dependencies using your preferred package manager:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server, accessible at `http://localhost:3001` (as configured in `nuxt.config.ts`):

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview the production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

## Post-installation setup

Prepare the Nuxt application after installing dependencies:

```bash
# npm
npm run postinstall
```

# Development Conventions

*   **Project Structure:** Follows standard Nuxt 3 directory conventions (`pages`, `components`, `store`, `server`, `public`, `plugins`).
*   **API Communication:** The application interacts with a WordPress backend at the URL specified in `runtimeConfig.public.wordpressUrl` (e.g., `https://s03.devdog.xyz/graphql`).

*   **Language & Configuration:** TypeScript is used throughout the codebase, with Nuxt configuration managed in `nuxt.config.ts`.
