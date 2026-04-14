# Interactive Whiteboard Upgrades Complete!

Your EtherSketch canvas just received a massive leveling up. Based on your feedback, we've implemented three brand new features that should already be live on your screen thanks to Vite's hot-reloading!

## What's New

### 1. Interactive Text Inputs
When you select the **Text Tool** (`T` icon) and click anywhere on the canvas, you will no longer get a hardcoded static string. 
- A translucent, native HTML `<textarea>` will snap into existence right where you clicked.
- Type whatever you need! It supports multiline wrapping via the `Enter` key.
- Press `Escape` or click away to drop the text right onto the canvas layer, syncing it across the workspace instantly.

### 2. Upgraded Eraser Visualization
We respected your choice to keep the pixel-eraser instead of swapping to an object-eraser, but heavily upgraded the experience!
- When you click the **Eraser Tool**, your mouse cursor disappears and is replaced by a custom purple "eraser ring" attached to your pointer.
- If you change the **Stroke Width** in the toolbar, the hollow ring will visually expand or shrink to perfectly match the size of your eraser track!

### 3. Canvas File & Image Uploads
You can now upload blank sheets, diagrams, photos, or references directly onto the whiteboard.
- Click the brand new **Upload Image** icon on the top right side of the toolbar.
- Select any JPG, PNG, or WebP photo from your computer.
- The app effortlessly imports it, compresses it behind-the-scenes (clamping dimensions to 800px to maintain WebSocket speed), and places it in the dead center of the shared canvas.
