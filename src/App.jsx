import React, { useState, useRef, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { STORES, DEVICE_CONFIGS } from './constants/storeConfigs';
import './App.css';

export default function App() {
  const canvasRef = useRef(null);

  // Active Store: 'app-store' or 'play-store'
  const [currentStore, setCurrentStore] = useState(STORES.APP_STORE);

  // Active Device ID
  const [currentDeviceId, setCurrentDeviceId] = useState('iphone-6-7');

  const currentDeviceConfig = DEVICE_CONFIGS[currentDeviceId] || DEVICE_CONFIGS['iphone-6-7'];

  // Native dimensions
  const canvasWidth = currentDeviceConfig.width;
  const canvasHeight = currentDeviceConfig.height;

  // Viewport Zoom
  const [viewportZoom, setViewportZoom] = useState(0.24);

  // Device-specific state map so customizations are preserved per device
  const [devicesStateMap, setDevicesStateMap] = useState({});

  // Shared / Active Device State
  const activeDeviceState = devicesStateMap[currentDeviceId] || {
    orientation: 'portrait',
    rotation: 0,
    screenshot: null,
    fitMode: 'cover',
    innerZoom: 1,
    innerX: 0,
    innerY: 0,
    frameScale: currentDeviceConfig.defaultScale || 1.8,
    frameX: 0,
    frameY: currentDeviceConfig.defaultY !== undefined ? currentDeviceConfig.defaultY : 320,
    shadowIntensity: 0.5,
    frameFinishId: currentStore === STORES.PLAY_STORE ? 'titanium-dark' : 'titanium-dark',
    customFrameColor: '#2d2d32',
    cameraStyleOverride: null,
    showGlare: false
  };

  const setDeviceState = (updater) => {
    setDevicesStateMap(prev => {
      const currentState = prev[currentDeviceId] || activeDeviceState;
      const nextState = typeof updater === 'function' ? updater(currentState) : updater;
      return {
        ...prev,
        [currentDeviceId]: {
          ...currentState,
          ...nextState
        }
      };
    });
  };

  // Auto-fit viewport zoom on window resize or device/canvas size change
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 110;
      const availableWidth = window.innerWidth - 420;
      const scaleH = availableHeight / canvasHeight;
      const scaleW = availableWidth / canvasWidth;
      const calculatedScale = Math.min(scaleH, scaleW);
      setViewportZoom(Math.min(Math.max(calculatedScale, 0.08), 1.0));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasHeight, canvasWidth]);

  // Switch Store
  const setStore = (storeId) => {
    setCurrentStore(storeId);
    // Switch to first device of selected store
    const firstDevice = Object.values(DEVICE_CONFIGS).find(d => d.store === storeId);
    if (firstDevice) {
      setCurrentDeviceId(firstDevice.id);
    }
  };

  // Switch Device
  const switchDevice = (deviceId) => {
    const targetConfig = DEVICE_CONFIGS[deviceId];
    if (!targetConfig) return;

    setCurrentDeviceId(deviceId);
    if (targetConfig.store !== currentStore) {
      setCurrentStore(targetConfig.store);
    }

    // Carry over screenshot if target device state doesn't have one
    setDevicesStateMap(prev => {
      const existing = prev[deviceId];
      if (!existing && activeDeviceState.screenshot) {
        return {
          ...prev,
          [deviceId]: {
            orientation: 'portrait',
            rotation: 0,
            screenshot: activeDeviceState.screenshot,
            fitMode: 'cover',
            innerZoom: 1,
            innerX: 0,
            innerY: 0,
            frameScale: targetConfig.defaultScale || 1.8,
            frameX: 0,
            frameY: targetConfig.defaultY !== undefined ? targetConfig.defaultY : 300,
            shadowIntensity: 0.5,
            frameFinishId: activeDeviceState.frameFinishId || 'titanium-dark',
            customFrameColor: activeDeviceState.customFrameColor || '#2d2d32',
            cameraStyleOverride: null,
            showGlare: activeDeviceState.showGlare || false
          }
        };
      }
      return prev;
    });
  };

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
    color1: '#0f172a',
    color2: '#0284c7',
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

  // Text state
  const [text, setText] = useState({
    badgeText: '',
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

  // Apply Quick Layout Presets
  const applyPreset = (presetType) => {
    const isFeature = currentDeviceId === 'play-feature-graphic';
    const isTablet = currentDeviceConfig.type.includes('tablet') || currentDeviceConfig.type === 'ipad';
    const isFold = currentDeviceConfig.type === 'android-foldable';

    if (isFeature) {
      if (presetType === 'bannerRight') {
        setDeviceState(p => ({ ...p, frameScale: 0.95, frameX: 280, frameY: 50, rotation: -6 }));
        setText(p => ({ ...p, align: 'left', offsetY: 50, titleSize: 56, subtitleSize: 28 }));
      } else if (presetType === 'bannerCenter') {
        setDeviceState(p => ({ ...p, frameScale: 0.85, frameX: 0, frameY: 160, rotation: 0 }));
        setText(p => ({ ...p, align: 'center', offsetY: 25, titleSize: 50, subtitleSize: 24 }));
      } else if (presetType === 'bannerSlanted') {
        setDeviceState(p => ({ ...p, frameScale: 1.05, frameX: 290, frameY: 60, rotation: -16 }));
        setText(p => ({ ...p, align: 'left', offsetY: 48, titleSize: 54, subtitleSize: 26 }));
      } else if (presetType === 'bannerTextOnly') {
        setDeviceState(p => ({ ...p, frameScale: 0.7, frameX: 350, frameY: 200, rotation: 0 }));
        setText(p => ({ ...p, align: 'left', offsetY: 50, titleSize: 64, subtitleSize: 32 }));
      }
      return;
    }

    if (presetType === 'centered') {
      const scale = isTablet ? 2.2 : isFold ? 2.1 : 1.85;
      const y = isTablet ? 300 : isFold ? 250 : 350;
      setDeviceState(p => ({ ...p, frameScale: scale, frameX: 0, frameY: y, rotation: 0 }));
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'bottomPeek') {
      const scale = isTablet ? 2.4 : isFold ? 2.3 : 2.05;
      const y = isTablet ? 550 : isFold ? 480 : 580;
      setDeviceState(p => ({ ...p, frameScale: scale, frameX: 0, frameY: y, rotation: 0 }));
      setText(p => ({ ...p, align: 'center', offsetY: 14 }));
    } else if (presetType === 'slanted') {
      const scale = isTablet ? 2.1 : isFold ? 2.0 : 1.8;
      const y = isTablet ? 320 : isFold ? 280 : 360;
      setDeviceState(p => ({ ...p, frameScale: scale, frameX: 0, frameY: y, rotation: -12 }));
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'fullFit') {
      const scale = isTablet ? 2.6 : isFold ? 2.4 : 2.2;
      const y = isTablet ? 250 : isFold ? 200 : 260;
      setDeviceState(p => ({ ...p, frameScale: scale, frameX: 0, frameY: y, rotation: 0 }));
      setText(p => ({ ...p, align: 'center', offsetY: 10 }));
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
    const availableHeight = window.innerHeight - 110;
    const availableWidth = window.innerWidth - 420;
    const scaleH = availableHeight / canvasHeight;
    const scaleW = availableWidth / canvasWidth;
    const calculatedScale = Math.min(scaleH, scaleW);
    setViewportZoom(Math.min(Math.max(calculatedScale, 0.08), 1.0));
  };

  // Export High-Res Screenshot
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
      await new Promise(r => setTimeout(r, 150));

      const dataUrl = await toPng(cloneNode, {
        quality: 1,
        pixelRatio: 1,
        width: canvasWidth,
        height: canvasHeight
      });

      const storePrefix = currentStore === STORES.PLAY_STORE ? 'google-play' : 'apple-app-store';
      const link = document.createElement('a');
      link.download = `${storePrefix}-${currentDeviceId}-${activeDeviceState.orientation}-${canvasWidth}x${canvasHeight}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Could not export screenshot. Trying fallback...');
      try {
        const dataUrl = await toPng(canvasRef.current, { quality: 1, pixelRatio: 1 });
        const link = document.createElement('a');
        link.download = `${currentDeviceId}-screenshot.png`;
        link.href = dataUrl;
        link.click();
      } catch (fallbackErr) {
        console.error('Fallback export error:', fallbackErr);
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
    currentStore,
    setStore,
    currentDeviceId,
    switchDevice,
    currentDeviceConfig,
    canvasWidth,
    canvasHeight,
    bgState,
    setBgState,
    deviceState: activeDeviceState,
    setDeviceState,
    text,
    setText,
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
            <div className="store-pill-indicator">
              {currentStore === STORES.PLAY_STORE ? '🤖 Google Play Store' : '🍎 Apple App Store'}
            </div>
            <span className="app-title">{currentDeviceConfig.name}</span>
            <span className="badge">
              {canvasWidth} × {canvasHeight} px
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button className="icon-btn" onClick={() => setViewportZoom(z => Math.max(z - 0.05, 0.05))} title="Zoom Out"><ZoomOut size={16} /></button>
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
            {isExporting ? 'Generating PNG...' : `Export ${canvasWidth}×${canvasHeight}`}
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
