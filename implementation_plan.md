# EtherSketch Implementation Plan

EtherSketch is a high-performance, real-time collaborative workspace web application similar to a combination of Google Jamboard, Figma, and Notion. It features zero-lag synchronization using CRDTs (Yjs) and Socket.io.

## User Review Required

> [!IMPORTANT]
> Please review this implementation plan. I have adapted your 7-phase outline. If everything looks correct, I will proceed with **Phase 1: Project Setup**.
> Since we need MongoDB Atlas credentials for Phase 1, you can either provide the connection string later or let me create a placeholder for it now.
> Note: Regarding the model, you're currently using Gemini 3.1 Pro (High), but I will follow all your step-by-step instructions effectively!

## Proposed Architecture

- **Frontend (Client)**: Vite + React.js, TailwindCSS, Rough.js / Konva.js / Fabric.js, Yjs
- **Backend (Server)**: Node.js, Express.js, Socket.io, MongoDB Atlas, JWT
- **Structure**:
  ```text
  ethersketch/
  ├── client/         (React frontend)
  ├── server/         (Node.js backend)
  └── README.md
  ```

---

## Phase 1 — Project Setup (CURRENT FOCUS)

1. **Root Directory**: Initialize `ethersketch` working space (this corresponds to the current workspace).
2. **Frontend (`client/`)**:
   - Initialize React via Vite: `npx create-vite@latest client --template react`
   - Setup TailwindCSS
   - Install dependencies: `yjs`, `y-socket.io` (or `y-websocket`), `socket.io-client`, `react-router-dom`, `konva` / `react-konva` (or `fabric` depending on further decisions), `lucide-react` (for icons).
3. **Backend (`server/`)**:
   - Initialize Node application: `npm init -y` inside `server/`
   - Install dependencies: `express`, `cors`, `dotenv`, `mongoose`, `socket.io`, `jsonwebtoken`, `bcryptjs`, `yjs`, `y-socket.io`
   - Setup basic Express server with `Socket.io`
   - Setup MongoDB Atlas connection via Mongoose using `dotenv`.

---

## Future Phases Overview

### Phase 2 — Authentication
- Register and Login pages (React)
- JWT auth API (Node.js)
- Auth middleware for protected routes

### Phase 3 — Room System
- Dashboard to Create Room / Join Room by ID
- Store room data in MongoDB
- Unique shareable links

### Phase 4 — Collaborative Canvas
- Setup canvas (Konva.js / Fabric.js)
- Integrate Yjs for CRDT sync over Socket.io
- Drawing tools (pen, shapes, text, eraser)
- Color picker & stroke width.

### Phase 5 — Live Cursors
- Broadcast user cursor positions via Socket.io
- Display cross-client cursors with name labels.

### Phase 6 — Undo/Redo + Save
- Yjs `UndoManager`
- On-demand and 30-second auto-save to MongoDB.

### Phase 7 — Export + Polish
- Export canvas as PNG/PDF
- Dark/Light mode, Responsive UI, Toast notifications.

## Open Questions

1. **Canvas Library Preference**: Would you prefer `react-konva` or `fabric.js` for the canvas? `react-konva` is very React-native and fits well with our stack.
2. **Database URI**: Are you ready to provide a MongoDB Atlas connection string (or should I use a placeholder in `.env` for now)?

## Verification Plan
For Phase 1, I will verify the project structure and provide a directory tree, confirming all configurations and installations ran successfully without errors.
