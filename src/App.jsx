import React, { useState, useRef, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { STORES, DEVICE_CONFIGS } from './constants/storeConfigs';
import './App.css';

const createInitialDevice = (configId = 'iphone-6-7') => {
  const config = DEVICE_CONFIGS[configId] || DEVICE_CONFIGS['iphone-6-7'];
  return {
    id: 'device-1',
    name: 'Phone 1',
    configId: configId,
    orientation: 'portrait',
    rotation: 0,
    screenshot: null,
    fitMode: 'cover',
    innerZoom: 1,
    innerX: 0,
    innerY: 0,
    frameScale: config.defaultScale || 1.8,
    frameX: 0,
    frameY: config.defaultY !== undefined ? config.defaultY : 320,
    shadowIntensity: 0.5,
    frameFinishId: 'titanium-dark',
    customFrameColor: '#2d2d32',
    cameraStyleOverride: null,
    showGlare: false,
    zIndex: 10
  };
};

export default function App() {
  const canvasRef = useRef(null);

  // Active Store: 'app-store' or 'play-store'
  const [currentStore, setCurrentStore] = useState(STORES.APP_STORE);

  // Active Store Format (Canvas Dimensions)
  const [currentDeviceId, setCurrentDeviceId] = useState('iphone-6-7');

  const currentDeviceConfig = DEVICE_CONFIGS[currentDeviceId] || DEVICE_CONFIGS['iphone-6-7'];

  // Native dimensions
  const canvasWidth = currentDeviceConfig.width;
  const canvasHeight = currentDeviceConfig.height;

  // Viewport Zoom
  const [viewportZoom, setViewportZoom] = useState(0.24);

  // Multi-Device State List
  const [devicesList, setDevicesList] = useState([createInitialDevice('iphone-6-7')]);

  // Active selected device ID
  const [activeDeviceId, setActiveDeviceId] = useState('device-1');

  // Currently active device object
  const activeDeviceState = devicesList.find(d => d.id === activeDeviceId) || devicesList[0] || createInitialDevice(currentDeviceId);

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

  const [isExporting, setIsExporting] = useState(false);

  // Update a specific device
  const updateDevice = (id, updater) => {
    setDevicesList(prev => prev.map(d => {
      if (d.id === id) {
        const next = typeof updater === 'function' ? updater(d) : updater;
        return { ...d, ...next };
      }
      return d;
    }));
  };

  // Update active device (compatibility with single device controls)
  const setDeviceState = (updater) => {
    if (activeDeviceId) {
      updateDevice(activeDeviceId, updater);
    }
  };

  // Add a new device to the canvas (supports iOS, Android, Tablets, etc.)
  const addDevice = (configId = null, overrides = {}) => {
    const newId = `device-${Date.now()}`;
    const newIndex = devicesList.length + 1;
    
    const targetConfigId = configId || activeDeviceState?.configId || currentDeviceId || 'iphone-6-7';
    const targetConfig = DEVICE_CONFIGS[targetConfigId] || DEVICE_CONFIGS['iphone-6-7'];
    const isTargetAndroid = targetConfig.store === STORES.PLAY_STORE;

    const newDevice = {
      id: newId,
      name: `${isTargetAndroid ? 'Android' : 'iPhone'} ${newIndex}`,
      configId: targetConfigId,
      orientation: activeDeviceState?.orientation || 'portrait',
      rotation: 0,
      screenshot: null,
      fitMode: 'cover',
      innerZoom: 1,
      innerX: 0,
      innerY: 0,
      frameScale: targetConfig?.defaultScale || 1.8,
      frameX: (activeDeviceState?.frameX || 0) + 140,
      frameY: (activeDeviceState?.frameY || 320) + 40,
      shadowIntensity: 0.5,
      frameFinishId: 'titanium-dark',
      customFrameColor: '#2d2d32',
      cameraStyleOverride: null,
      showGlare: activeDeviceState?.showGlare || false,
      zIndex: (devicesList.length + 1) * 10,
      ...overrides
    };

    setDevicesList(prev => [...prev, newDevice]);
    setActiveDeviceId(newId);
  };

  // Remove a device from canvas
  const removeDevice = (id) => {
    if (devicesList.length <= 1) return;
    setDevicesList(prev => {
      const filtered = prev.filter(d => d.id !== id);
      if (activeDeviceId === id && filtered.length > 0) {
        setActiveDeviceId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Duplicate an existing device
  const duplicateDevice = (id) => {
    const target = devicesList.find(d => d.id === id) || activeDeviceState;
    if (!target) return;
    const newId = `device-${Date.now()}`;
    const newIndex = devicesList.length + 1;
    const duplicated = {
      ...target,
      id: newId,
      name: `Phone ${newIndex}`,
      frameX: (target.frameX || 0) + 110,
      frameY: (target.frameY || 0) + 40,
      zIndex: (devicesList.length + 1) * 10
    };
    setDevicesList(prev => [...prev, duplicated]);
    setActiveDeviceId(newId);
  };

  // Reorder Device (Bring forward / Send backward)
  const reorderDevice = (id, direction) => {
    const index = devicesList.findIndex(d => d.id === id);
    if (index === -1) return;
    const list = [...devicesList];
    if (direction === 'forward' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else if (direction === 'backward' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'front') {
      const item = list.splice(index, 1)[0];
      list.push(item);
    } else if (direction === 'back') {
      const item = list.splice(index, 1)[0];
      list.unshift(item);
    }
    const updated = list.map((d, idx) => ({ ...d, zIndex: (idx + 1) * 10 }));
    setDevicesList(updated);
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

  // Global Clipboard Paste Listener (Ctrl+V / Cmd+V for images onto active phone)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (evt) => {
              if (activeDeviceId) {
                updateDevice(activeDeviceId, { screenshot: evt.target.result });
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    const handleWindowDragOver = (e) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e) => {
      if (!e.defaultPrevented && e.dataTransfer?.files?.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (activeDeviceId) {
              updateDevice(activeDeviceId, { screenshot: evt.target.result });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [activeDeviceId]);

  // Switch Store (Updates canvas format and dimensions for target store)
  const setStore = (storeId) => {
    setCurrentStore(storeId);
    const firstDevice = Object.values(DEVICE_CONFIGS).find(d => d.store === storeId);
    if (firstDevice) {
      setCurrentDeviceId(firstDevice.id);
    }
  };

  // Switch Device Format
  const switchDevice = (deviceId) => {
    const targetConfig = DEVICE_CONFIGS[deviceId];
    if (!targetConfig) return;

    setCurrentDeviceId(deviceId);
    if (targetConfig.store !== currentStore) {
      setCurrentStore(targetConfig.store);
    }

    if (activeDeviceId) {
      updateDevice(activeDeviceId, {
        configId: deviceId,
        frameScale: targetConfig.defaultScale || 1.8,
        frameY: targetConfig.defaultY !== undefined ? targetConfig.defaultY : 320
      });
    }
  };

  // Apply Quick Layout Presets (Multi-Phone & Single Phone)
  const applyPreset = (presetType) => {
    const isFeature = currentDeviceId === 'play-feature-graphic';
    const isTablet = currentDeviceConfig.type.includes('tablet') || currentDeviceConfig.type === 'ipad';
    const isFold = currentDeviceConfig.type === 'android-foldable';
    const baseConfig = currentDeviceConfig.id;

    if (isFeature) {
      if (presetType === 'bannerRight') {
        setDevicesList([
          {
            ...devicesList[0],
            id: 'device-1',
            name: devicesList[0]?.name || 'Phone 1',
            configId: devicesList[0]?.configId || baseConfig,
            frameScale: 0.95,
            frameX: 280,
            frameY: 50,
            rotation: -6,
            zIndex: 10
          }
        ]);
        setActiveDeviceId('device-1');
        setText(p => ({ ...p, align: 'left', offsetY: 50, titleSize: 56, subtitleSize: 28 }));
      } else if (presetType === 'bannerDualRight') {
        setDevicesList([
          {
            ...devicesList[0],
            id: 'device-1',
            name: devicesList[0]?.name || 'Phone 1',
            configId: devicesList[0]?.configId || baseConfig,
            frameScale: 0.85,
            frameX: 180,
            frameY: 70,
            rotation: -8,
            zIndex: 10
          },
          {
            ...(devicesList[1] || devicesList[0]),
            id: 'device-2',
            name: devicesList[1]?.name || 'Phone 2',
            configId: devicesList[1]?.configId || baseConfig,
            frameScale: 0.92,
            frameX: 360,
            frameY: 40,
            rotation: 0,
            zIndex: 20
          }
        ]);
        setActiveDeviceId('device-2');
        setText(p => ({ ...p, align: 'left', offsetY: 50, titleSize: 54, subtitleSize: 26 }));
      } else if (presetType === 'bannerCenter') {
        setDevicesList([
          {
            ...devicesList[0],
            id: 'device-1',
            name: devicesList[0]?.name || 'Phone 1',
            configId: devicesList[0]?.configId || baseConfig,
            frameScale: 0.85,
            frameX: 0,
            frameY: 160,
            rotation: 0,
            zIndex: 10
          }
        ]);
        setActiveDeviceId('device-1');
        setText(p => ({ ...p, align: 'center', offsetY: 25, titleSize: 50, subtitleSize: 24 }));
      } else if (presetType === 'bannerSlanted') {
        setDevicesList([
          {
            ...devicesList[0],
            id: 'device-1',
            name: devicesList[0]?.name || 'Phone 1',
            configId: devicesList[0]?.configId || baseConfig,
            frameScale: 1.05,
            frameX: 290,
            frameY: 60,
            rotation: -16,
            zIndex: 10
          }
        ]);
        setActiveDeviceId('device-1');
        setText(p => ({ ...p, align: 'left', offsetY: 48, titleSize: 54, subtitleSize: 26 }));
      } else if (presetType === 'bannerTextOnly') {
        setDevicesList([]);
        setText(p => ({ ...p, align: 'center', offsetY: 35, titleSize: 68, subtitleSize: 32 }));
      }
      return;
    }

    // ==========================================
    // 📱 SINGLE PHONE PRESETS (1 Device)
    // ==========================================
    if (presetType === 'centered') {
      const scale = isTablet ? 2.2 : isFold ? 2.1 : 1.85;
      const y = isTablet ? 300 : isFold ? 250 : 350;
      setDevicesList([
        {
          ...(devicesList[0] || createInitialDevice(baseConfig)),
          id: 'device-1',
          name: devicesList[0]?.name || 'Phone 1',
          frameScale: scale,
          frameX: 0,
          frameY: y,
          rotation: 0,
          zIndex: 10
        }
      ]);
      setActiveDeviceId('device-1');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'bottomPeek') {
      const scale = isTablet ? 2.4 : isFold ? 2.3 : 2.05;
      const y = isTablet ? 550 : isFold ? 480 : 580;
      setDevicesList([
        {
          ...(devicesList[0] || createInitialDevice(baseConfig)),
          id: 'device-1',
          name: devicesList[0]?.name || 'Phone 1',
          frameScale: scale,
          frameX: 0,
          frameY: y,
          rotation: 0,
          zIndex: 10
        }
      ]);
      setActiveDeviceId('device-1');
      setText(p => ({ ...p, align: 'center', offsetY: 14 }));
    } else if (presetType === 'slanted') {
      const scale = isTablet ? 2.1 : isFold ? 2.0 : 1.8;
      const y = isTablet ? 320 : isFold ? 280 : 360;
      setDevicesList([
        {
          ...(devicesList[0] || createInitialDevice(baseConfig)),
          id: 'device-1',
          name: devicesList[0]?.name || 'Phone 1',
          frameScale: scale,
          frameX: 0,
          frameY: y,
          rotation: -12,
          zIndex: 10
        }
      ]);
      setActiveDeviceId('device-1');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'slantedRight') {
      const scale = isTablet ? 2.1 : isFold ? 2.0 : 1.8;
      const y = isTablet ? 320 : isFold ? 280 : 360;
      setDevicesList([
        {
          ...(devicesList[0] || createInitialDevice(baseConfig)),
          id: 'device-1',
          name: devicesList[0]?.name || 'Phone 1',
          frameScale: scale,
          frameX: 0,
          frameY: y,
          rotation: 12,
          zIndex: 10
        }
      ]);
      setActiveDeviceId('device-1');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'fullFit') {
      const scale = isTablet ? 2.6 : isFold ? 2.4 : 2.2;
      const y = isTablet ? 250 : isFold ? 200 : 260;
      setDevicesList([
        {
          ...(devicesList[0] || createInitialDevice(baseConfig)),
          id: 'device-1',
          name: devicesList[0]?.name || 'Phone 1',
          frameScale: scale,
          frameX: 0,
          frameY: y,
          rotation: 0,
          zIndex: 10
        }
      ]);
      setActiveDeviceId('device-1');
      setText(p => ({ ...p, align: 'center', offsetY: 10 }));
    } else if (presetType === 'floatingHero') {
      const scale = isTablet ? 2.15 : isFold ? 2.0 : 1.8;
      setDevicesList([
        {
          ...(devicesList[0] || createInitialDevice(baseConfig)),
          id: 'device-1',
          name: devicesList[0]?.name || 'Phone 1',
          frameScale: scale,
          frameX: 30,
          frameY: 340,
          rotation: -6,
          zIndex: 10
        }
      ]);
      setActiveDeviceId('device-1');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    }

    // ==========================================
    // 📱📱 DUAL PHONE PRESETS (2 Devices)
    // ==========================================
    else if (presetType === 'dualSide') {
      const scale = isTablet ? 1.7 : isFold ? 1.6 : 1.48;
      const y = isTablet ? 320 : isFold ? 270 : 360;
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1',
          frameScale: scale,
          frameX: -280,
          frameY: y,
          rotation: 0,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2',
          frameScale: scale,
          frameX: 280,
          frameY: y,
          rotation: 0,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'dualOverlap') {
      const scale1 = isTablet ? 1.65 : 1.45;
      const scale2 = isTablet ? 1.85 : 1.62;
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1 (Back)',
          frameScale: scale1,
          frameX: -220,
          frameY: 380,
          rotation: -10,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2 (Front)',
          frameScale: scale2,
          frameX: 200,
          frameY: 330,
          rotation: 0,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'dualPerspective') {
      const scale = isTablet ? 1.7 : 1.5;
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1',
          frameScale: scale,
          frameX: -260,
          frameY: 340,
          rotation: -12,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2',
          frameScale: scale,
          frameX: 260,
          frameY: 340,
          rotation: 12,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    } else if (presetType === 'crossPlatformDuo') {
      const dev1 = devicesList[0] || createInitialDevice('iphone-6-7');
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: 'iPhone (iOS)',
          configId: 'iphone-6-7',
          frameScale: 1.48,
          frameX: -280,
          frameY: 360,
          rotation: -5,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: 'Android Flagship',
          configId: 'android-phone',
          frameScale: 1.48,
          frameX: 280,
          frameY: 360,
          rotation: 5,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({
        ...p,
        badgeText: '',
        title: 'Available on iOS & Android',
        subtitle: 'Get the best experience on App Store & Google Play.',
        align: 'center',
        offsetY: 12
      }));
    } else if (presetType === 'bottomPeekDual') {
      const scale = isTablet ? 2.0 : 1.75;
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1',
          frameScale: scale,
          frameX: -260,
          frameY: 580,
          rotation: 0,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2',
          frameScale: scale,
          frameX: 260,
          frameY: 580,
          rotation: 0,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({ ...p, align: 'center', offsetY: 14 }));
    } else if (presetType === 'dualFloating') {
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1',
          frameScale: 1.42,
          frameX: -240,
          frameY: 410,
          rotation: -8,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2',
          frameScale: 1.58,
          frameX: 220,
          frameY: 310,
          rotation: 4,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({ ...p, align: 'center', offsetY: 12 }));
    }

    // ==========================================
    // 🌟 TRIPLE / MULTI PHONE PRESETS (3+ Devices)
    // ==========================================
    else if (presetType === 'tripleShowcase') {
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };
      const dev3 = devicesList[2] || { ...dev1, id: 'device-3', name: 'Phone 3', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1 (Left)',
          frameScale: 1.35,
          frameX: -380,
          frameY: 380,
          rotation: -14,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2 (Center)',
          frameScale: 1.65,
          frameX: 0,
          frameY: 300,
          rotation: 0,
          zIndex: 30
        },
        {
          ...dev3,
          id: 'device-3',
          name: dev3.name || 'Phone 3 (Right)',
          frameScale: 1.35,
          frameX: 380,
          frameY: 380,
          rotation: 14,
          zIndex: 20
        }
      ]);
      setActiveDeviceId('device-2');
      setText(p => ({ ...p, align: 'center', offsetY: 10 }));
    } else if (presetType === 'tripleOverlap') {
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };
      const dev3 = devicesList[2] || { ...dev1, id: 'device-3', name: 'Phone 3', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1',
          frameScale: 1.35,
          frameX: -320,
          frameY: 420,
          rotation: -8,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2',
          frameScale: 1.48,
          frameX: -40,
          frameY: 360,
          rotation: -4,
          zIndex: 20
        },
        {
          ...dev3,
          id: 'device-3',
          name: dev3.name || 'Phone 3',
          frameScale: 1.62,
          frameX: 240,
          frameY: 300,
          rotation: 0,
          zIndex: 30
        }
      ]);
      setActiveDeviceId('device-3');
      setText(p => ({ ...p, align: 'center', offsetY: 10 }));
    } else if (presetType === 'tripleSide') {
      const dev1 = devicesList[0] || createInitialDevice(baseConfig);
      const dev2 = devicesList[1] || { ...dev1, id: 'device-2', name: 'Phone 2', screenshot: null };
      const dev3 = devicesList[2] || { ...dev1, id: 'device-3', name: 'Phone 3', screenshot: null };

      setDevicesList([
        {
          ...dev1,
          id: 'device-1',
          name: dev1.name || 'Phone 1',
          frameScale: 1.25,
          frameX: -360,
          frameY: 350,
          rotation: 0,
          zIndex: 10
        },
        {
          ...dev2,
          id: 'device-2',
          name: dev2.name || 'Phone 2',
          frameScale: 1.25,
          frameX: 0,
          frameY: 350,
          rotation: 0,
          zIndex: 20
        },
        {
          ...dev3,
          id: 'device-3',
          name: dev3.name || 'Phone 3',
          frameScale: 1.25,
          frameX: 360,
          frameY: 350,
          rotation: 0,
          zIndex: 30
        }
      ]);
      setActiveDeviceId('device-2');
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
      
      // Remove any UI overlays (focus badges, edit outlines) from exported graphic
      cloneNode.querySelectorAll('.studio-ui-only').forEach(el => el.remove());
      cloneNode.querySelectorAll('.device-mockup-chassis').forEach(el => {
        const normalBorder = el.getAttribute('data-normal-border');
        const normalShadow = el.getAttribute('data-normal-shadow');
        if (normalBorder) el.style.border = normalBorder;
        if (normalShadow) el.style.boxShadow = normalShadow;
      });
      
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
    devicesList,
    setDevicesList,
    activeDeviceId,
    setActiveDeviceId,
    activeDevice: activeDeviceState,
    deviceState: activeDeviceState,
    updateDevice,
    setDeviceState,
    addDevice,
    removeDevice,
    duplicateDevice,
    reorderDevice,
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
