import React, { useState, useRef, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import './App.css';

export default function App() {
  const canvasRef = useRef(null);
  
  // App Mode: 'iphone' or 'ipad'
  const [device, setDevice] = useState('iphone');
  
  // Native dimensions
  const canvasWidth = device === 'iphone' ? 1284 : 2048;
  const canvasHeight = device === 'iphone' ? 2778 : 2732;

  // Viewport Zoom
  const [viewportZoom, setViewportZoom] = useState(0.24);

  // Auto-fit viewport zoom on window resize or device switch
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 100; // Leave room for top toolbar & padding
      const calculatedScale = availableHeight / canvasHeight;
      setViewportZoom(Math.min(Math.max(calculatedScale, 0.1), 1.0));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasHeight]);

  // Custom Font Library
  const [availableFonts, setAvailableFonts] = useState([
    { name: 'Cairo (Arabic/Eng Display)', value: 'Cairo' },
    { name: 'Tajawal (Arabic/Eng Clean)', value: 'Tajawal' },
    { name: 'Almarai (Arabic Bold)', value: 'Almarai' },
    { name: 'Readex Pro (Modern Arabic)', value: 'Readex Pro' },
    { name: 'Outfit (Bold Display)', value: 'Outfit' },
    { name: 'Inter (Clean Modern)', value: 'Inter' },
    { name: 'Montserrat (Geometric)', value: 'Montserrat' },
    { name: 'Poppins (Rounded)', value: 'Poppins' },
    { name: 'Playfair Display (Serif)', value: 'Playfair Display' },
    { name: 'Bebas Neue (Impact)', value: 'Bebas Neue' },
  ]);

  // Background state
  const [bgState, setBgState] = useState({
    type: 'gradient',
    color: '#0f172a',
    color1: '#1e1b4b',
    color2: '#4338ca',
    gradientType: 'linear',
    gradientAngle: 135,
    image: null,
    scale: 1,
    posX: 0,
    posY: 0,
    blur: 0,
    overlayColor: '#000000',
    overlayOpacity: 0
  });

  // iPhone state
  const [iphoneState, setIphoneState] = useState({
    orientation: 'portrait',
    rotation: 0,
    screenshot: null,
    fitMode: 'cover',
    innerZoom: 1,
    innerX: 0,
    innerY: 0,
    frameScale: 1.8,
    frameX: 0,
    frameY: 350,
    shadowIntensity: 0.5
  });

  // iPad state
  const [ipadState, setIpadState] = useState({
    orientation: 'portrait',
    rotation: 0,
    screenshot: null,
    fitMode: 'cover',
    innerZoom: 1,
    innerX: 0,
    innerY: 0,
    frameScale: 2.1,
    frameX: 0,
    frameY: 300,
    shadowIntensity: 0.5
  });

  // Text state
  const [text, setText] = useState({
    title: 'Your App Headline',
    titleSize: 110,
    titleColor: '#ffffff',
    subtitle: 'Add a subtitle highlighting your best features.',
    subtitleSize: 52,
    subtitleColor: '#cbd5e1',
    fontFamily: 'Cairo',
    offsetY: 12,
    align: 'center'
  });

  const [isExporting, setIsExporting] = useState(false);

  // Switch between iPhone & iPad
  const switchDeviceMode = (newMode) => {
    setDevice(newMode);
  };

  const currentDeviceState = device === 'iphone' ? iphoneState : ipadState;
  const setDeviceState = device === 'iphone' ? setIphoneState : setIpadState;

  // Apply Quick Layout Presets
  const applyPreset = (presetType) => {
    if (presetType === 'centered') {
      setDeviceState(p => ({ ...p, frameScale: device === 'ipad' ? 2.2 : 1.9, frameX: 0, frameY: 200, rotation: 0 }));
    } else if (presetType === 'bottomPeek') {
      setDeviceState(p => ({ ...p, frameScale: device === 'ipad' ? 2.4 : 2.0, frameX: 0, frameY: 550, rotation: 0 }));
    } else if (presetType === 'slanted') {
      setDeviceState(p => ({ ...p, frameScale: device === 'ipad' ? 2.1 : 1.8, frameX: 0, frameY: 300, rotation: -12 }));
    } else if (presetType === 'fullFit') {
      setDeviceState(p => ({ ...p, frameScale: device === 'ipad' ? 2.6 : 2.2, frameX: 0, frameY: 250, rotation: 0 }));
    }
  };

  // Register Custom Uploaded Font File (.ttf, .otf, .woff)
  const registerCustomFont = async (file) => {
    try {
      const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9\s_-]/g, "");
      const arrayBuffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, arrayBuffer);
      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);

      setAvailableFonts(prev => [{ name: `Custom: ${fontName}`, value: fontName }, ...prev]);
      setText(p => ({ ...p, fontFamily: fontName }));
      alert(`Font "${fontName}" uploaded & applied successfully!`);
    } catch (err) {
      console.error('Font load error:', err);
      alert('Could not load font file. Please ensure it is a valid .ttf, .otf, or .woff file.');
    }
  };

  // Auto-fit zoom reset
  const fitZoomToScreen = () => {
    const availableHeight = window.innerHeight - 100;
    const calculatedScale = availableHeight / canvasHeight;
    setViewportZoom(Math.min(Math.max(calculatedScale, 0.1), 1.0));
  };

  // Export Screenshot
  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    let exportHost = null;
    try {
      const cloneNode = canvasRef.current.cloneNode(true);
      
      exportHost = document.createElement('div');
      exportHost.style.position = 'fixed';
      exportHost.style.top = '-9999px';
      exportHost.style.left = '-9999px';
      exportHost.style.width = `${canvasWidth}px`;
      exportHost.style.height = `${canvasHeight}px`;
      exportHost.style.transform = 'none';
      exportHost.style.zIndex = '-9999';
      exportHost.style.pointerEvents = 'none';
      exportHost.appendChild(cloneNode);

      document.body.appendChild(exportHost);
      await new Promise(r => setTimeout(r, 120));

      const dataUrl = await toPng(cloneNode, {
        quality: 1,
        pixelRatio: 1,
        width: canvasWidth,
        height: canvasHeight
      });

      const link = document.createElement('a');
      link.download = `${device}-${currentDeviceState.orientation}-app-store.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Could not export screenshot. Trying fallback...');
      try {
        const dataUrl = await toPng(canvasRef.current, { quality: 1, pixelRatio: 1 });
        const link = document.createElement('a');
        link.download = `${device}-app-store.png`;
        link.href = dataUrl;
        link.click();
      } catch (e) {
        alert('Export failed.');
      }
    } finally {
      if (exportHost && exportHost.parentNode) {
        exportHost.parentNode.removeChild(exportHost);
      }
      setIsExporting(false);
    }
  };

  const state = {
    device,
    switchDeviceMode,
    canvasWidth,
    canvasHeight,
    bgState,
    setBgState,
    deviceState: currentDeviceState,
    setDeviceState,
    text, setText,
    availableFonts,
    registerCustomFont,
    applyPreset
  };

  return (
    <div className="app-layout">
      {/* Sidebar Controls */}
      <Sidebar state={state} />

      {/* Main Studio Area */}
      <div className="studio-area">
        {/* Top Header Toolbar */}
        <div className="top-header">
          <div className="app-branding">
            <span className="app-title">AppStore Studio Pro</span>
            <span className="badge">
              {device === 'iphone' ? 'iPhone 6.7" (1284x2778)' : 'iPad 12.9" (2048x2732)'}
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button className="icon-btn" onClick={() => setViewportZoom(z => Math.max(z - 0.05, 0.1))} title="Zoom Out"><ZoomOut size={16} /></button>
            <span className="zoom-val">{Math.round(viewportZoom * 100)}%</span>
            <button className="icon-btn" onClick={() => setViewportZoom(z => Math.min(z + 0.05, 1.0))} title="Zoom In"><ZoomIn size={16} /></button>
            <button className="icon-btn" onClick={fitZoomToScreen} title="Fit Screen"><Maximize2 size={14} /></button>
            
            {/* Quick Zoom Preset Buttons */}
            <div className="quick-zoom-presets">
              {[0.15, 0.25, 0.5, 1.0].map(z => (
                <button
                  key={z}
                  className={`zoom-preset-btn ${Math.abs(viewportZoom - z) < 0.03 ? 'active' : ''}`}
                  onClick={() => setViewportZoom(z)}
                >
                  {z * 100}%
                </button>
              ))}
            </div>
          </div>

          <button 
            className={`export-btn ${isExporting ? 'exporting' : ''}`} 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download size={18} />
            {isExporting ? 'Generating PNG...' : 'Export High-Res PNG'}
          </button>
        </div>

        {/* Studio Stage with Clean Scaled View */}
        <div className="clean-preview-area">
          <div
            style={{
              transform: `scale(${viewportZoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out'
            }}
          >
            <Canvas ref={canvasRef} state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}
