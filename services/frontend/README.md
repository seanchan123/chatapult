# Frontend

This is the **Next.js** (TypeScript) frontend for **Chatapult**, a multi-service project that interacts with the **Auth Service** and **Database Service** to provide a user interface for chat and folder management, and **AI Dialogue Service** for generating context-enriched AI responses. The frontend uses **Tailwind CSS** for styling, along with **React Context** for global authentication state.

## Overview

- **Framework**: [Next.js 13+ (App Router)](https://nextjs.org/docs/app)  
- **Language**: TypeScript  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **Auth & Global State**: React Context + Cookies  
- **API Communication**: Fetch requests to  `auth-service`, `database-service` and `ai-dialogue-service`
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown)  

## Prerequisites

1. **Node.js** (v14+ recommended)  
2. **npm** or **yarn** (any Node package manager)  
3. **Environment Variables** properly set up (see below)

## Folder Structure

```
frontend
├─ .next                        # Next.js build output
├─ node_modules
├─ public                       # Static assets
├─ src
│  ├─ app
│  │  ├─ chats
│  │  │  ├─ [chat_id]
│  │  │  │  └─ page.tsx        # Existing chat page
│  │  │  ├─ folders
│  │  │  │  └─ [folder_id]
│  │  │  │     └─ page.tsx     # Chats under a folder
│  │  │  ├─ new
│  │  │  │  └─ page.tsx        # Create a new chat
│  │  │  └─ page.tsx           # All Chats page
│  │  ├─ login
│  │  │  └─ page.tsx           # Login page
│  │  ├─ register
│  │  │  └─ page.tsx           # Registration page
│  │  ├─ layout.tsx            # Root layout (header, providers, etc.)
│  │  └─ page.tsx              # Home page
│  ├─ components
│  │  ├─ common
│  │  │  └─ ThemeToggle.tsx    # Dark/Light mode toggle
│  │  └─ layout
│  │     └─ Header.tsx         # Main navigation header
│  ├─ contexts
│  │  └─ AuthContext.tsx       # Auth context provider
│  ├─ styles
│  │  └─ globals.css           # Global Tailwind styles
│  └─ ...
├─ tailwind.config.js
├─ postcss.config.js
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Environment Variables

Create a `.env.local` (or `.env`) file in the root of the `frontend` folder.  
Below are the typical environment variables used in the code:

```bash
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:4000          # URL for the Auth Service
NEXT_PUBLIC_DATABASE_SERVICE_URL=http://localhost:5000      # URL for the Database Service
NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL=http://localhost:8000   # URL for the AI Dialogue Service
NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY=internal_api_key_for_ai_dialogue
```

- **`NEXT_PUBLIC_...`**: Next.js requires variables prefixed with `NEXT_PUBLIC_` to expose them to the client bundle.  

## Installation and Setup

1. **Install Dependencies**  
   ```bash
   cd frontend
   npm install
   # or yarn install
   ```

2. **Set Up `.env.local`**  
   Make sure your `.env.local` includes the correct URLs for the other services (auth, database, ai-dialogue).

3. **Run the Development Server**  
   ```bash
   npm run dev
   # or yarn dev
   ```
   - By default, Next.js runs on [http://localhost:3000](http://localhost:3000).

4. **Build for Production**  
   ```bash
   npm run build
   npm run start
   ```
   - The built app is served on [http://localhost:3000](http://localhost:3000) unless otherwise configured.

## Main Features

### Authentication

- **`AuthContext`**: Stores and manages user login state (JWT token + username).  
- **Cookies**: `js-cookie` is used to store `authToken` and `username`.  
- **Login**: The `login` function sets the cookies and updates global auth state.  
- **Logout**: Clears cookies and redirects to `/`.  

### Chat Management

- **`/chats`**: Displays a list of top-level chats (folderId=none) and all user folders.  
- **Drag-and-Drop**: You can drag a chat card onto a folder to update that chat’s folder.  
- **`/chats/new`**: Create a brand-new chat, sending a prompt to the `ai-dialogue-service`. Once a response is generated, the conversation is saved to the `database-service`, then you are redirected to the new chat’s page.  
- **`/chats/[chat_id]`**: View or continue an existing chat.  
- **`/chats/folders/[folder_id]`**: Display all chats belonging to that folder, plus an option to rename or delete the folder.

### Markdown Rendering

- The chat messages are rendered using **`react-markdown`**, with a custom `components` prop to style headings, paragraphs, tables, code blocks, etc. in a Tailwind-friendly way.

### Theming

- **Dark/Light Mode** is toggled with `ThemeToggle.tsx`.  
- A user’s preference is stored in `localStorage` and toggles the `dark` class on `document.documentElement`.

## Key Scripts

- **`npm run dev`**: Starts the development server on `localhost:3000`.  
- **`npm run build`**: Builds the Next.js application for production.  
- **`npm run start`**: Runs the compiled production build.  

## Deployment

- **Vercel** or **Netlify** are typical for Next.js hosting.  
- Make sure to provide environment variables in your deployment settings.  
- The app can also be containerized if desired.

---

© 2025 Chatapult  
Part of the Chatapult project located at `services/frontend`.