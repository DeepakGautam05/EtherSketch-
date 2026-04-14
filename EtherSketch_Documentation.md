# EtherSketch – Project Architecture & Logic Flow
This document maps out the entire functionality of the EtherSketch platform. Use it to understand and present the data flow, the core logic within different files, and the overarching framework mapping.

## Technology Stack Overview
- **Frontend (Client):** React, React Router (for navigation), Tailwind CSS / Vanilla CSS (for styling), React-Konva (for Canvas drawing operations).
- **Backend (Server):** Node.js, Express.js (REST APIs).
- **Real-Time Engine:** Socket.IO & Yjs (Conflict-free Replicated Data Types - CRDT) synced over WebSockets.
- **Database:** MongoDB (via Mongoose for user persistence), LocalStorage (for UI session configuration and mock persistence).

---

## 1. Authentication Flow
**Files Involved:**
- `server/controllers/authController.js`
- `server/models/User.js`
- `client/src/pages/Auth.jsx`

**Logic Details:**
- **User Object Model (`User.js`):** Contains the schema for creating users. It uses a Mongoose `pre-save` hook to encrypt user passwords using `bcrypt` before storing them in MongoDB.
- **Auth Controller (`authController.js`):** Handles the `/api/auth/register` and `/api/auth/login` endpoints. For login, it uses `bcrypt.compare` to verify the password, then generates a JSON Web Token (JWT) that gets returned to the client.
- **Auth Page (`Auth.jsx`):** On the frontend, clicking the toggle switches between "Sign In" and "Sign Up". The component sends the Axios POST request and, upon receiving the JWT, stores it locally natively using `localStorage.setItem('userInfo')`.

---

## 2. Dashboard & Project Management
**Files Involved:**
- `client/src/pages/LandingPage.jsx`
- `client/src/pages/Dashboard.jsx`

**Logic Details:**
- **Landing Page Enforcer (`LandingPage.jsx`):** Employs strict "auth-first" routing. All Call-to-Action (CTA) buttons (`Get Started`, `Pricing`, etc.) execute `navigate('/auth')`, trapping unauthenticated users into the flow.
- **Dashboard Minimalism (`Dashboard.jsx`):**
  - **Local Persistence:** Uses React's `useState` combined with browser `localStorage.getItem('myProjects')`. This allows the minimalist dashboard grid to remember user projects without forcing massive backend database storage.
  - **Backend Synchronization:** When a user clicks **New Project**, `Dashboard.jsx` calls the Backend API `createRoom(token)`. The backend returns a unique `roomId` string. The dashboard tracks this string secretly on the React `ProjectCard` object, and navigates the browser to `/room/:roomId`.
  - **Card Interactions:** Options like Rename, Duplicate, and Delete strictly perform local array filtering/mutation via React state, and instantly re-freeze the data to `localStorage`.

---

## 3. Real-Time Collaborative Canvas (The Core)
**Files Involved:**
- `client/src/pages/Workspace.jsx`
- `client/src/components/CanvasBoard.jsx`
- `client/src/components/Toolbar.jsx`
- `server/index.js` (WebSockets)

**Logic Details:**
- **Connection Handshake (`Workspace.jsx`):** This is the master wrapper. It wraps around the `CanvasBoard`. On load, it creates a `Y.Doc` (a Yjs interactive document) and binds it to a `WebsocketProvider` targeting the Node.js server. The `WebsocketProvider` constantly syncs the `yMap` (which contains your canvas lines).
- **The Toolbar Interface (`Toolbar.jsx`):** Passes simple string tools up to the parent component (e.g. `setTool('pencil' | 'eraser' | 'text')`). It also executes a hidden HTML `<input type="file" />` stream when clicking "Upload Image".
- **Drawing Mechanics (`CanvasBoard.jsx`):** 
  - Uses `react-konva` for high-performance 2D WebGL drawing.
  - **Freehand lines:** Clicking mouse generates a line array. `onMouseMove` updates the active line array with X/Y coordinates points. `onMouseUp` fires `yMap.set()` broadcasting your entire stroke to everyone in the room via Yjs.
  - **Eraser Logic:** Selects erasing and effectively draws transparent lines over elements or deletes underlying elements via bounding boxes (using `globalCompositeOperation="destination-out"`). Also actively sizes the visual purple ring based on stroke weight configurations.
  - **Textboxes:** Intercepts mouse clicks when the `Text` tool is selected. Immediately injects a floating HTML `<textarea>` at the absolute screen position (using `window.scrollY/X` formulas) allowing standard keyboard typing before permanently baking it into the `Konva` canvas layer.
  - **Image Processing:** Extracts incoming base64 buffers from the Toolbar upload, converts them via `new window.Image()`, dynamically restricts large file widths via a fixed canvas sizing algorithm, and injects them onto the Stage for all users.

---

## 4. Why This Architecture Works (Presentation Talking Points)
When presenting this architecture, emphasize these points:
1. **Offline Capability & Conflict Resolution:** Since `Yjs` handles the collaborative arrays, the CRDT math natively assumes "conflict-free replication." If two people draw instantly while a packet lags, the system mathematically merges the arrays flawlessly rather than skipping data.
2. **Lean Database Approach:** By keeping user authentication strictly on MongoDB and project layout configuration in `localStorage`, the relational database avoids massive bottleneck hits compared to saving coordinates in SQL. 
3. **Decoupled Engine:** The `Konva` implementation translates data points to the screen immediately but leaves network validation entirely to `y-websocket` Node streams. This makes the drawing feel strictly like a single-player high-refresh application despite being natively multiplayer.
