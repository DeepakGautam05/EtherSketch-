# EtherSketch - Advanced Interview & Architecture Guide

This document provides a comprehensive overview of the **EtherSketch** project. It is designed to act as a study guide or reference document for technical interviews, breaking down the architecture, the unique technical decisions made, and how the system can scale.

---

## 1. What We Built (Project Overview)

**EtherSketch** is a high-performance, real-time collaborative workspace and digital whiteboard. It allows multiple distributed users to sketch, write, and ideate simultaneously on a shared canvas without experiencing conflicts or lag. Let's break down the core features we implemented:

* **Real-time Canvas Engine**: A high-performance 2D drawing surface utilizing HTML5 Canvas APIs via `react-konva`.
* **Multiplayer Synchronization**: Instantaneous peer-to-peer data syncing using WebSockets so users see paths drawn, shapes created, and text typed in real time.
* **Live Cursor Awareness**: Broadcasting localized mouse coordinates to specific rooms, rendering visual name-tagged cursors for other users hovering over the canvas.
* **Robust Object Handling**: Dynamic shape rendering (pens, rectangles, circles, lines, arrows, text, and image dropping) layered efficiently to minimize DOM recalculations.
* **Authentication & Persistence**: Secure JWT-based login system that ties users to encrypted rooms, automatically hydridating canvas states backwards from a MongoDB cloud cluster.

---

## 2. How Everything Works (The Architecture)

The project leverages a decoupled **Client-Server Architecture** running on the MERN stack context alongside real-time duplex pipelines.

### The Frontend (Client)
* **Framework**: React.js (Vite) for rapid lifecycle management. Styling is entirely handled by Tailwind CSS utilizing dynamic responsive layouts and glassmorphism UI.
* **The Canvas**: Built on `react-konva`. Unlike standard React which creates HTML DOM nodes (like `<div>` or `<p>`), Konva parses mathematical vector data into a single physical `<canvas>` element. This bypasses the browser's expensive CSS layout engine, allowing 60FPS fluid rendering even with thousands of objects.
* **State Management**: Local GUI states (like `activeTool` or `color`) are handled by React. Canvas-drawn states are intercepted and instantly handed off to the Yjs engine.

### The Data Layer & Backend (Server)
* **The Server**: A Node.js / Express backend provides standard REST APIs (for Authentication, Room generation, and MongoDB saving).
* **The Real-Time Engine**: We ran a massive `Socket.io` websocket instance over the server. Instead of sending raw drawing coordinates over the wire manually, we attached `y-socket.io`.
* **The Database**: MongoDB (Mongoose) permanently serializes the Yjs distributed memory arrays into stringified formats when the workspace is saved. Upon entering an empty room, the frontend requests a "hydration payload" from Mongo to rebuild the state.

---

## 3. The "Unique Thing" (The CRDT Magic)

The most unique and technologically impressive aspect of EtherSketch is **how** it handles multiplayer collaboration.

Most beginner applications build multiplayer boards by doing this:
* *Naive Approach*: Client A draws a line -> Sends coordinates to Server -> Server blindly broadcasts coordinates to Client B. 
* *The Problem*: If two people draw simultaneously on a bad internet connection, packets arrive out of order, overriding each other, causing massive server bottlenecks and visual tearing.

**Our Approach: CRDT (Conflict-free Replicated Data Types)**
We utilized the **`Yjs`** library, an advanced CRDT implementation. Rather than the server being the "source of truth", Yjs turns the canvas state into a distributed mathematical matrix. 
* Every shape (or text letter) is given a unique identifier and clock sequence. 
* When you draw, it updates your *local state first* (zero latency).
* It then emits tiny mathematical "diffs" over WebSockets. 
* Even if users go offline or experience heavy lag, when the network catches up, the localized Yjs engines on the clients automatically merge the mathematical arrays seamlessly without any overwrites or conflicts. 

---

## 4. How to Scale It (System Design)

If EtherSketch needed to handle thousands of concurrent users in hundreds of rooms, we would employ the following horizontal scaling techniques:

1. **Redis Pub/Sub adapter for Socket.io**: Right now, our WebSocket server lives on one Node.js instance. If we spawn a second Node.js server to handle traffic, users on Server A cannot see drawings from users on Server B. By plugging in a Redis adapter, Redis acts as a high-speed message bus broadcasting the Yjs socket events *between* multiple servers behind a Load Balancer (like Nginx/AWS ALB).
2. **CDN for Static Assets**: Offload the heavy React client bundle to a CDN (Cloudflare/AWS CloudFront) to immediately push it to user edges globally.
3. **Database Sharding**: As the rooms scale horizontally, we can shard MongoDB based on the `roomId` or regional data, preventing a single database node from becoming an I/O bottleneck.
4. **WebRTC for Peer-to-Peer**: For ultra-heavy rooms (50+ active participants), we could upgrade from `y-socket.io` to `y-webrtc`. This would allow users to sync coordinates directly with each other (P2P mesh), bypassing our server entirely and eliminating almost all backend bandwidth costs.

---

## 5. Technical Interview Buzzwords (And what they mean here)

* **CRDT (Conflict-free Replicated Data Type)**: The mathematics behind our Yjs implementation guaranteeing data consistency across disconnected peers. 
* **Duplex Communication (WebSockets)**: Unlike REST (which is request->wait->respond), WebSockets hold an open, bi-directional pipe for instantaneous data pushing via `Socket.io`.
* **Virtual DOM vs Immediate Mode GUI**: React uses a Virtual DOM (slower, layout-heavy DOM nodes). Our canvas (`react-konva`) uses Immediate Mode 2D rendering (paints pixels directly to the GPU via the HTML5 canvas layer).
* **Stateless Authentication (JWT)**: Our servers don't remember who is logged in. They issue a mathematically signed JSON Web Token string. The frontend sends this back, and the server validates the cryptographics, allowing horizontal server scaling without session-memory issues.
* **Debouncing / Polling**: Used historically in auto-saves (e.g., waiting 30 seconds before saving to MongoDB).
* **State Hydration**: The process of the frontend grabbing stored physical parameters from the backend (MongoDB) and injecting them into the localized Yjs arrays to visually restore the canvas on first load.
