import React from 'react';
import { Pencil, Square, Circle, Minus, MoveRight, Type, Eraser, Undo, Redo, Save, Download, Sun, Moon, Upload } from 'lucide-react';

const tools = [
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: MoveRight, label: 'Arrow' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

const colors = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
const strokeWidths = [2, 4, 6, 8, 12];

const Toolbar = ({ activeTool, setActiveTool, color, setColor, strokeWidth, setStrokeWidth, onUndo, onRedo, onManualSave, onExport, onImageUpload, theme, toggleTheme }) => {
  return (
    <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 ${theme === 'light' ? 'bg-white/90 border-gray-200 text-gray-800 shadow-md' : 'bg-white/5 border-white/10 text-white shadow-2xl'} border rounded-2xl p-2.5 flex flex-wrap gap-3 z-50 items-center justify-center backdrop-blur-xl transition-all w-[95%] xl:w-max duration-500`}>
      
      {/* Theme Toggle */}
      <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300' : 'bg-white/10 hover:bg-white/20 text-yellow-400'}`}>
         {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/10'} hidden sm:block`}></div>

      {/* Tools */}
      <div className={`flex ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40'} rounded-xl p-1 gap-1`}>
        {tools.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setActiveTool(t.id)}
            className={`p-2 rounded-lg transition-all ${activeTool === t.id ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-md text-white' : `${theme === 'light' ? 'text-gray-500 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}`}
          >
            <t.icon size={20} />
          </button>
        ))}
      </div>

      <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/10'} hidden lg:block`}></div>

      {/* Colors */}
      <div className={`flex gap-2 items-center ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40'} rounded-xl p-1.5`}>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full shadow-inner transition-all duration-300 ${color === c ? 'scale-125 ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
            style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
            title={`Color ${c}`}
          />
        ))}
      </div>
      
      <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/10'} hidden md:block`}></div>

      {/* Stroke Width */}
      <div className={`flex gap-2 ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40'} rounded-xl p-1.5 items-center font-mono text-sm hidden md:flex`}>
        {strokeWidths.map(w => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            className={`w-6 h-6 rounded-lg transition-all flex items-center justify-center ${strokeWidth === w ? (theme === 'light' ? 'bg-gray-300' : 'bg-white/20 ring-1 ring-white/50') : (theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10')}`}
          >
            <div className={`${theme === 'light' ? 'bg-gray-700' : 'bg-white'} rounded-full transition-all`} style={{ width: w+1, height: w+1 }}></div>
          </button>
        ))}
      </div>

      <div className={`w-px h-8 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/10'} hidden sm:block`}></div>

      {/* Actions */}
      <div className={`flex ${theme === 'light' ? 'bg-gray-100' : 'bg-black/40'} rounded-xl p-1 gap-1`}>
        <button onClick={onUndo} title="Undo (Ctrl+Z)" className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
          <Undo size={20} />
        </button>
        <button onClick={onRedo} title="Redo (Ctrl+Y)" className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
          <Redo size={20} />
        </button>
        <button onClick={onManualSave} title="Force Save (Ctrl+S)" className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'text-gray-600 hover:text-green-600 hover:bg-green-100' : 'text-gray-400 hover:text-green-400 hover:bg-white/10'}`}>
          <Save size={20} />
        </button>
        <button onClick={onExport} title="Export as PNG" className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-100' : 'text-gray-400 hover:text-blue-400 hover:bg-white/10'}`}>
          <Download size={20} />
        </button>
        <button onClick={() => document.getElementById('image-upload').click()} title="Upload Image" className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'text-gray-600 hover:text-purple-600 hover:bg-purple-100' : 'text-gray-400 hover:text-purple-400 hover:bg-white/10'}`}>
          <Upload size={20} />
          <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              if (onImageUpload) onImageUpload(e.target.files[0]);
              e.target.value = null; // reset
            }
          }} />
        </button>
      </div>

    </div>
  );
};

export default Toolbar;
