import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CanvasBoard from '../components/CanvasBoard';
import Toolbar from '../components/Toolbar';
import { LogOut, Cloud, CheckCircle2 } from 'lucide-react';

const Workspace = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // States
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#a855f7'); 
  const [strokeWidth, setStrokeWidth] = useState(4); 
  
  const [saveStatus, setSaveStatus] = useState(null); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // theme states

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const showToast = (message) => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // 30 Second Auto-Save Poller Phase 6
  useEffect(() => {
    const interval = setInterval(async () => {
      if (canvasRef.current) {
        const success = await canvasRef.current.save();
        if (success) {
           showToast('Auto-saved to cloud');
        }
      }
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts Bindings
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) canvasRef.current?.redo();
          else canvasRef.current?.undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          canvasRef.current?.redo();
        } else if (e.key === 's') {
          e.preventDefault();
          const success = await canvasRef.current?.save();
          if (success) showToast('Manually saved');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleManualSave = async () => {
     const success = await canvasRef.current?.save();
     if (success) showToast('Manually saved');
  }

  const handleExport = () => {
     canvasRef.current?.exportAsPNG();
     showToast('Canvas Exported!');
  }

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${theme === 'light' ? 'bg-[#f4f4f6]' : 'bg-[#121212]'}`}>
      
      {/* Background blobs specific to workspace */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full filter blur-[128px] opacity-20 transition-all duration-700 ${theme === 'light' ? 'bg-purple-300' : 'bg-purple-600 mix-blend-multiply'}`} style={{ animation: 'blob 7s infinite', animationDelay: '1000ms' }}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full filter blur-[128px] opacity-20 transition-all duration-700 ${theme === 'light' ? 'bg-blue-300' : 'bg-blue-600 mix-blend-multiply'}`} style={{ animation: 'blob 7s infinite', animationDelay: '3000ms' }}></div>

      {/* Rich Tooling Ribbon */}
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        color={color} 
        setColor={setColor} 
        strokeWidth={strokeWidth} 
        setStrokeWidth={setStrokeWidth}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
        onManualSave={handleManualSave}
        onExport={handleExport}
        onImageUpload={(file) => canvasRef.current?.insertImage(file)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* Dashboard Returning logic */}
      <button 
        onClick={() => navigate('/dashboard')}
        className={`absolute top-4 sm:top-6 left-4 sm:left-6 z-50 p-2 sm:p-2.5 border rounded-xl shadow-xl flex items-center gap-2 group backdrop-blur-md transition-all ${theme === 'light' ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="hidden xl:inline font-semibold text-sm">Dashboard</span>
      </button>

      {/* Cloud Status / Toast Notification */}
      {saveStatus && (
        <div className={`absolute bottom-24 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce ${theme === 'light' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-green-500/20 border border-green-500/50 text-green-300'}`}>
           <CheckCircle2 size={16} />
           <span className="font-medium tracking-wide">{saveStatus}</span>
        </div>
      )}

      {/* Workspace Link info */}
      <div className={`absolute top-4 sm:top-auto sm:bottom-6 right-4 sm:right-6 z-50 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-xl text-xs shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3 transition-colors ${theme === 'light' ? 'bg-white/80 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}>
        <span className={`uppercase tracking-widest font-semibold text-[10px] hidden sm:block text-gray-500`}>Workspace ID</span>
        <span className={`font-mono px-2 py-1 rounded select-all cursor-pointer font-bold text-[10px] sm:text-xs ${theme === 'light' ? 'bg-gray-100 text-purple-600' : 'bg-black/40 text-purple-300'}`} title="Share this code safely">{roomId}</span>
      </div>

      {/* Canvas */}
      <div className={`flex-1 relative w-full h-full ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
        <CanvasBoard 
           roomId={roomId} 
           activeTool={activeTool} 
           color={color} 
           strokeWidth={strokeWidth} 
           ref={canvasRef}
        />
      </div>
      
    </div>
  );
};

export default Workspace;
