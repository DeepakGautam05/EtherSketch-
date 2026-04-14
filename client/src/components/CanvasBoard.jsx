import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text as KonvaText, Group, Path, Image as KonvaImage } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { saveRoom, getRoom } from '../utils/api';

const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const URLImage = ({ src, x, y, width, height }) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const i = new window.Image();
    i.src = src;
    i.onload = () => setImg(i);
  }, [src]);
  return img ? <KonvaImage image={img} x={x} y={y} width={width} height={height} /> : null;
};

const CanvasBoard = forwardRef(({ roomId, activeTool, color, strokeWidth }, ref) => {
  const stageRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [cursors, setCursors] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [yMap, setYMap] = useState(null);
  const [provider, setProvider] = useState(null);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [textInputPos, setTextInputPos] = useState(null);
  const [activeTextId, setActiveTextId] = useState(null);
  const [textValue, setTextValue] = useState("");
  
  const undoManagerRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Anonymous' };
  const userColor = useRef('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));

  // Allow Workspace.jsx to call undo, redo, format save remotely!
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (undoManagerRef.current) undoManagerRef.current.undo();
    },
    redo: () => {
      if (undoManagerRef.current) undoManagerRef.current.redo();
    },
    save: async () => {
      if (!yMap) return;
      try {
        const shapesArr = Array.from(yMap.values());
        await saveRoom(roomId, shapesArr, userInfo?.token);
        console.log('✅ Background Canvas Saved to MongoDB!');
        return true;
      } catch (err) {
        console.error('Failed to save to MongoDB:', err);
        return false;
      }
    },
    exportAsPNG: () => {
      if (stageRef.current) {
        // Find the actual canvas data url
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `ethersketch-${roomId.substring(0,6)}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    insertImage: (file) => {
      if (!yMap) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target.result;
        const i = new window.Image();
        i.onload = () => {
          let w = i.width;
          let h = i.height;
          if (w > 800) {
             h = h * (800 / w);
             w = 800;
          }
          const id = uuidv4();
          yMap.set(id, { id, type: 'image', src, x: window.innerWidth / 2 - w / 2, y: window.innerHeight / 2 - h / 2, width: w, height: h });
        };
        i.src = src;
      };
      reader.readAsDataURL(file);
    }
  }));

  const finalizeText = () => {
    if (!activeTextId || !yMap) return;
    const shape = yMap.get(activeTextId);
    if (shape && textValue.trim().length > 0) {
       yMap.set(activeTextId, { ...shape, text: textValue });
    } else {
       yMap.delete(activeTextId);
    }
    setActiveTextId(null);
    setTextInputPos(null);
  };

  // Initialize Yjs and socket.io sync
  useEffect(() => {
    const doc = new Y.Doc();
    const wsProvider = new SocketIOProvider(API_URL, roomId, doc, { autoConnect: true });
    setProvider(wsProvider);
    
    // The sync map for drawing
    const yShapesMap = doc.getMap('shapes');
    setYMap(yShapesMap);
    
    // Wire up Yjs UndoManager
    undoManagerRef.current = new Y.UndoManager(yShapesMap);

    const updateState = () => {
      const arr = Array.from(yShapesMap.values());
      setShapes(arr);
    };

    yShapesMap.observe(() => {
      updateState();
    });

    wsProvider.on('synced', async () => {
      console.log('✅ Canvas Synced with Peers!');
      
      // If we joined and the map is completely empty, attempt to hydrate from MongoDB!
      if (Array.from(yShapesMap.values()).length === 0) {
         try {
           const dbData = await getRoom(roomId, userInfo?.token);
           if (dbData && dbData.canvasData && dbData.canvasData.length > 0) {
             doc.transact(() => {
               dbData.canvasData.forEach(shape => {
                 yShapesMap.set(shape.id, shape);
               });
             });
             console.log('📦 Hydrated previous state from MongoDB!');
           }
         } catch(e) {
           console.log('No previous DB data to restore.');
         }
      }
      
      updateState();
    });

    // Tracking Awareness (Cursors)
    wsProvider.awareness.on('change', () => {
      const states = Array.from(wsProvider.awareness.getStates().entries());
      const newCursors = [];
      
      states.forEach(([clientId, state]) => {
        // Exclude our own cursor from rendering
        if (clientId !== wsProvider.awareness.clientID) {
          if (state.cursor) {
            newCursors.push({
              id: clientId,
              ...state.cursor
            });
          }
        }
      });
      setCursors(newCursors);
    });

    return () => {
      wsProvider.disconnect();
      doc.destroy();
    };
  }, [roomId]);

  const handleMouseDown = (e) => {
    if (!yMap) return;
    const pos = e.target.getStage().getPointerPosition();
    const id = uuidv4();
    
    setIsDrawing(true);
    
    // Erasing logic
    if (activeTool === 'eraser') {
      const newShape = { id, type: 'eraser', points: [pos.x, pos.y], stroke: '#121212', strokeWidth: strokeWidth * 3 };
      yMap.set(id, newShape);
      stageRef.current.currentShapeId = id;
      return;
    }
    
    // Text Logic
    if (activeTool === 'text') {
      if (activeTextId) finalizeText(); // finalize previous if any
      const newShape = {
        id, type: 'text', x: pos.x, y: pos.y, stroke: color, strokeWidth, text: ''
      };
      yMap.set(id, newShape);
      setActiveTextId(id);
      setTextInputPos({ x: pos.x, y: pos.y });
      setTextValue('');
      return;
    }
    
    // Drawing Logic
    const newShape = {
      id,
      type: activeTool,
      x: pos.x,
      y: pos.y,
      points: [pos.x, pos.y],
      stroke: color,
      strokeWidth,
      width: 0,
      height: 0,
      radius: 0
    };
    
    yMap.set(id, newShape);
    stageRef.current.currentShapeId = id; 
  };

  const handleMouseMove = (e) => {
    if (!yMap) return;
    const pos = e.target.getStage().getPointerPosition();
    setMousePos(pos);
    
    // Broadcast Live Cursor
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('cursor', {
        x: pos.x,
        y: pos.y,
        name: userInfo.name,
        color: userColor.current
      });
    }

    if (!isDrawing) return;

    const id = stageRef.current.currentShapeId;
    const shape = yMap.get(id);
    if (!shape) return;

    let updatedShape = { ...shape };

    if (activeTool === 'pen' || activeTool === 'eraser') {
      updatedShape.points = shape.points.concat([pos.x, pos.y]);
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      updatedShape.points = [shape.points[0], shape.points[1], pos.x, pos.y];
    } else if (activeTool === 'rectangle') {
      updatedShape.width = pos.x - shape.x;
      updatedShape.height = pos.y - shape.y;
    } else if (activeTool === 'circle') {
      const dx = pos.x - shape.x;
      const dy = pos.y - shape.y;
      updatedShape.radius = Math.sqrt(dx * dx + dy * dy);
    }
    
    yMap.set(id, updatedShape);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    stageRef.current.currentShapeId = null;
  };

  const handleMouseLeave = () => {
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('cursor', null);
    }
  };

  return (
    <div className={`w-full h-full ${activeTool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'} relative`} style={{ overflow: 'hidden' }}>
      {/* Floating Text Input */}
      {activeTextId && textInputPos && (
        <textarea
          autoFocus
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={finalizeText}
          onKeyDown={(e) => { if (e.key === 'Escape') finalizeText(); }}
          style={{
            position: 'absolute',
            top: textInputPos.y,
            left: textInputPos.x,
            color: color,
            fontSize: strokeWidth * 6,
            background: 'transparent',
            border: '2px dashed rgba(168, 85, 247, 0.5)',
            outline: 'none',
            minWidth: '200px',
            minHeight: '40px',
            resize: 'both',
            zIndex: 100,
            whiteSpace: 'pre-wrap',
            fontFamily: 'sans-serif',
            padding: '4px'
          }}
        />
      )}
      {/* Visual Eraser Cursor */}
      {activeTool === 'eraser' && (
         <div 
           style={{
             position: 'absolute',
             top: mousePos.y - ((strokeWidth * 3) / 2),
             left: mousePos.x - ((strokeWidth * 3) / 2),
             width: strokeWidth * 3,
             height: strokeWidth * 3,
             border: '2px solid rgba(168, 85, 247, 0.8)',
             backgroundColor: 'rgba(168, 85, 247, 0.1)',
             borderRadius: '50%',
             pointerEvents: 'none',
             zIndex: 99
           }}
         />
      )}
       <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === 'pen' || shape.type === 'eraser') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    shape.type === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              );
            }
            if (shape.type === 'rectangle') {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              );
            }
            if (shape.type === 'circle') {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              );
            }
            if (shape.type === 'line') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              );
            }
            if (shape.type === 'arrow') {
              return (
                <Arrow
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  pointerLength={shape.strokeWidth * 1.5}
                  pointerWidth={shape.strokeWidth * 1.5}
                />
              );
            }
            if (shape.type === 'text') {
              return (
                <KonvaText
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text}
                  fill={shape.stroke}
                  fontSize={shape.strokeWidth * 6}
                />
              );
            }
            if (shape.type === 'image') {
              return (
                <URLImage 
                  key={shape.id}
                  src={shape.src}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                />
              );
            }
            return null;
          })}
        </Layer>
        
        {/* Layer specifically mapping other users cursors so they render on top */}
        <Layer>
          {cursors.map(cursor => (
            <Group key={cursor.id} x={cursor.x} y={cursor.y}>
              <Path 
                data="M0 0 L 8.5 24 L 12.5 15 L 22 15 Z" 
                fill={cursor.color}
                stroke="#fff"
                strokeWidth={1.5}
                shadowColor="rgba(0,0,0,0.3)"
                shadowBlur={5}
              />
              <Rect 
                x={14} 
                y={18} 
                fill={cursor.color} 
                cornerRadius={5} 
                width={cursor.name.length * 8 + 10} 
                height={22}
                shadowColor="rgba(0,0,0,0.1)"
                shadowBlur={3}
              />
              <KonvaText 
                x={19} 
                y={23} 
                text={cursor.name} 
                fill="white" 
                fontSize={12} 
                fontStyle="bold"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
      
      {/* Connecting status indicator */}
      {provider && !provider.synced && (
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10 text-white font-medium flex items-center shadow-2xl">
            <div className="w-5 h-5 border-t-2 border-r-2 border-purple-500 rounded-full animate-spin mr-3"></div>
            Syncing Canvas Workspace...
         </div>
      )}
    </div>
  );
});

export default CanvasBoard;
