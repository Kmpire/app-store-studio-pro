import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Globe, FileDown, FileUp, FolderDown, ChevronDown, Undo2, Redo2 } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import JSZip from 'jszip';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import StripManager from './components/StripManager';
import StoreMockup from './components/StoreMockup';
import LocaleManagerModal from './components/LocaleManagerModal';
import ExportDropdown from './components/ExportDropdown';
import { STORES, DEVICE_CONFIGS } from './constants/storeConfigs';
import { SUPPORTED_LOCALES } from './constants/goldieLayouts';
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

const createInitialTextStyle = () => ({
  titleSize: 110,
  titleColor: '#ffffff',
  subtitleSize: 52,
  subtitleColor: '#cbd5e1',
  fontFamily: 'Cairo',
  offsetY: 12,
  align: 'center'
});

const createInitialScene = (id = 'scene-1', index = 1, formatId = 'iphone-6-7', storeId = STORES.APP_STORE) => ({
  id,
  deviceId: formatId,
  store: storeId,
  headlines: {
    'en-US': index === 1 ? 'Your App Headline' : `App Feature #${index}`,
    'ar-SA': index === 1 ? 'عنوان تطبيقك الجذاب' : `ميزة التطبيق #${index}`
  },
  subheads: {
    'en-US': 'Add a subtitle highlighting your best features.',
    'ar-SA': 'أضف وصفاً تسويقياً يبرز أهم مميزات تطبيقك.'
  },
  badgeText: '',
  textStyle: createInitialTextStyle(),
  devicesList: [createInitialDevice(formatId)],
  bgState: {
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
  }
});

export default function App() {
  const canvasRef = useRef(null);

  // Workflow Mode: 'editor' | 'strip' | 'mockup'
  const [viewMode, setViewMode] = useState('editor');

  // Prevent accidental progress loss on page refresh or navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Multi-Scenes list (starts with exactly 1 scene by default)
  const [scenes, setScenes] = useState(() => [createInitialScene('scene-1', 1)]);
  const [activeSceneId, setActiveSceneId] = useState('scene-1');
  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
  const activeSceneIndex = scenes.findIndex(s => s.id === activeSceneId);

  // History State for Undo / Redo
  const [history, setHistory] = useState(() => [{
    scenes: [createInitialScene('scene-1', 1)],
    activeSceneId: 'scene-1'
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isNavigatingHistoryRef = useRef(false);
  const debounceHistoryTimeoutRef = useRef(null);
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;
  const historyRef = useRef(history);
  historyRef.current = history;

  // Active Store & Canvas Dimensions derived directly per activeScene
  const currentStore = activeScene.store || STORES.APP_STORE;
  const currentDeviceId = activeScene.deviceId || 'iphone-6-7';
  const currentDeviceConfig = DEVICE_CONFIGS[currentDeviceId] || DEVICE_CONFIGS['iphone-6-7'];

  // Native dimensions for active scene
  const canvasWidth = currentDeviceConfig.width;
  const canvasHeight = currentDeviceConfig.height;

  // Viewport Zoom
  const [viewportZoom, setViewportZoom] = useState(0.24);

  // Active Device in the scene
  const devicesList = activeScene.devicesList || [];
  const [activeDeviceId, setActiveDeviceId] = useState(() => devicesList[0]?.id || 'device-1');
  const activeDeviceState = devicesList.find(d => d.id === activeDeviceId) || devicesList[0] || createInitialDevice(currentDeviceId);

  const activeSceneIdRef = useRef(activeSceneId);
  activeSceneIdRef.current = activeSceneId;
  const activeDeviceIdRef = useRef(activeDeviceId);
  activeDeviceIdRef.current = activeDeviceId;
  const devicesListRef = useRef(devicesList);
  devicesListRef.current = devicesList;

  // Ensure activeDeviceId always belongs to the current scene's devices
  useEffect(() => {
    const curList = activeScene.devicesList || [];
    if (curList.length > 0 && !curList.some(d => d.id === activeDeviceId)) {
      setActiveDeviceId(curList[0].id);
    }
  }, [activeSceneId]);

  // Record history snapshot with smart debounce for continuous interactions
  useEffect(() => {
    if (isNavigatingHistoryRef.current) {
      isNavigatingHistoryRef.current = false;
      return;
    }

    if (debounceHistoryTimeoutRef.current) {
      clearTimeout(debounceHistoryTimeoutRef.current);
    }

    debounceHistoryTimeoutRef.current = setTimeout(() => {
      const curIndex = historyIndexRef.current;
      const curHistory = historyRef.current;

      const newSnapshot = {
        scenes: JSON.parse(JSON.stringify(scenes)),
        activeSceneId: activeSceneIdRef.current
      };

      const lastSnapshot = curHistory[curIndex];
      if (lastSnapshot && JSON.stringify(lastSnapshot.scenes) === JSON.stringify(newSnapshot.scenes)) {
        return;
      }

      const sliced = curHistory.slice(0, curIndex + 1);
      const updated = [...sliced, newSnapshot];
      if (updated.length > 40) {
        updated.shift();
      }

      setHistory(updated);
      setHistoryIndex(updated.length - 1);
    }, 350);

    return () => {
      if (debounceHistoryTimeoutRef.current) {
        clearTimeout(debounceHistoryTimeoutRef.current);
      }
    };
  }, [scenes]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    const curIndex = historyIndexRef.current;
    if (curIndex <= 0) return;

    if (debounceHistoryTimeoutRef.current) {
      clearTimeout(debounceHistoryTimeoutRef.current);
    }

    const targetIndex = curIndex - 1;
    const targetSnapshot = historyRef.current[targetIndex];
    if (!targetSnapshot) return;

    isNavigatingHistoryRef.current = true;
    setHistoryIndex(targetIndex);
    setScenes(JSON.parse(JSON.stringify(targetSnapshot.scenes)));
    if (targetSnapshot.activeSceneId) {
      setActiveSceneId(targetSnapshot.activeSceneId);
    }
  };

  const handleRedo = () => {
    const curIndex = historyIndexRef.current;
    if (curIndex >= historyRef.current.length - 1) return;

    if (debounceHistoryTimeoutRef.current) {
      clearTimeout(debounceHistoryTimeoutRef.current);
    }

    const targetIndex = curIndex + 1;
    const targetSnapshot = historyRef.current[targetIndex];
    if (!targetSnapshot) return;

    isNavigatingHistoryRef.current = true;
    setHistoryIndex(targetIndex);
    setScenes(JSON.parse(JSON.stringify(targetSnapshot.scenes)));
    if (targetSnapshot.activeSceneId) {
      setActiveSceneId(targetSnapshot.activeSceneId);
    }
  };

  // Background State for active scene
  const bgState = activeScene.bgState;
  const setBgState = (updater) => {
    setScenes(prev => prev.map(sc => {
      if (sc.id === activeSceneId) {
        const nextBg = typeof updater === 'function' ? updater(sc.bgState) : updater;
        return { ...sc, bgState: nextBg };
      }
      return sc;
    }));
  };

  // Locales: Default 1 language ('en-US')
  const [locales, setLocales] = useState(['en-US']);
  const [activeLocale, setActiveLocale] = useState('en-US');
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState(false);
  const currentLocaleObj = SUPPORTED_LOCALES.find(l => l.code === activeLocale) || { flag: '🌐', name: activeLocale };

  // Top Header Dropdowns State
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Text State for active scene & active locale (isolated per slide via scene.textStyle)
  const [text, setTextInternal] = useState(() => {
    const sceneStyle = activeScene.textStyle || createInitialTextStyle();
    return {
      badgeText: activeScene.badgeText || '',
      title: activeScene.headlines[activeLocale] || activeScene.headlines['en-US'] || 'Your App Headline',
      titleSize: sceneStyle.titleSize ?? 110,
      titleColor: sceneStyle.titleColor ?? '#ffffff',
      subtitle: activeScene.subheads[activeLocale] || activeScene.subheads['en-US'] || 'Add a subtitle highlighting your best features.',
      subtitleSize: sceneStyle.subtitleSize ?? 52,
      subtitleColor: sceneStyle.subtitleColor ?? '#cbd5e1',
      fontFamily: sceneStyle.fontFamily ?? 'Cairo',
      offsetY: sceneStyle.offsetY ?? 12,
      align: sceneStyle.align ?? 'center'
    };
  });

  // Sync text when active scene or active locale changes
  useEffect(() => {
    const sceneStyle = activeScene.textStyle || createInitialTextStyle();
    setTextInternal({
      badgeText: activeScene.badgeText || '',
      title: activeScene.headlines[activeLocale] || activeScene.headlines['en-US'] || '',
      subtitle: activeScene.subheads[activeLocale] || activeScene.subheads['en-US'] || '',
      titleSize: sceneStyle.titleSize ?? 110,
      titleColor: sceneStyle.titleColor ?? '#ffffff',
      subtitleSize: sceneStyle.subtitleSize ?? 52,
      subtitleColor: sceneStyle.subtitleColor ?? '#cbd5e1',
      fontFamily: sceneStyle.fontFamily ?? 'Cairo',
      offsetY: sceneStyle.offsetY ?? 12,
      align: sceneStyle.align ?? 'center'
    });
  }, [activeSceneId, activeLocale, activeScene.headlines, activeScene.subheads, activeScene.badgeText, activeScene.textStyle]);

  // Sync back text modifications to active scene with textStyle persistence
  const setText = (updater) => {
    setTextInternal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setScenes(scs => scs.map(s => {
        if (s.id === activeSceneId) {
          return {
            ...s,
            badgeText: next.badgeText !== undefined ? next.badgeText : (s.badgeText || ''),
            headlines: next.title !== undefined ? { ...s.headlines, [activeLocale]: next.title } : s.headlines,
            subheads: next.subtitle !== undefined ? { ...s.subheads, [activeLocale]: next.subtitle } : s.subheads,
            textStyle: {
              titleSize: next.titleSize ?? s.textStyle?.titleSize ?? 110,
              titleColor: next.titleColor ?? s.textStyle?.titleColor ?? '#ffffff',
              subtitleSize: next.subtitleSize ?? s.textStyle?.subtitleSize ?? 52,
              subtitleColor: next.subtitleColor ?? s.textStyle?.subtitleColor ?? '#cbd5e1',
              fontFamily: next.fontFamily ?? s.textStyle?.fontFamily ?? 'Cairo',
              offsetY: next.offsetY ?? s.textStyle?.offsetY ?? 12,
              align: next.align ?? s.textStyle?.align ?? 'center'
            }
          };
        }
        return s;
      }));
      return next;
    });
  };

  // Handle translation matrix text updates in LocaleManagerModal
  const handleUpdateSceneText = (sceneId, localeCode, field, value) => {
    setScenes(scs => scs.map(s => {
      if (s.id === sceneId) {
        if (field === 'headline') {
          return { ...s, headlines: { ...s.headlines, [localeCode]: value } };
        } else {
          return { ...s, subheads: { ...s.subheads, [localeCode]: value } };
        }
      }
      return s;
    }));
  };

  const handleAddLocale = (code) => {
    if (!locales.includes(code)) {
      setLocales(p => [...p, code]);
    }
    setActiveLocale(code);
  };

  const handleRemoveLocale = (code) => {
    if (locales.length <= 1) return;
    const remaining = locales.filter(c => c !== code);
    setLocales(remaining);
    if (activeLocale === code) {
      setActiveLocale(remaining[0]);
    }
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
    { name: 'Bebas Neue (Impact)', value: 'Bebas Neue' }
  ]);

  // Store Metadata for Simulator
  const [storeMetadata, setStoreMetadata] = useState({
    appName: 'App Name',
    subtitle: { 'en-US': 'Your app subtitle or slogan', 'ar-SA': 'وصف قصير وجذاب للتطبيق' },
    developer: 'Developer Studio',
    category: 'Productivity',
    rating: 4.9,
    ratingCount: '14.2K Ratings',
    ageRating: '4+',
    description: {
      'en-US': 'Supercharge your daily routine with intuitive navigation and stunning design.\n\n• High performance\n• Cloud sync\n• 100% Secure',
      'ar-SA': 'ارتقِ بتجربتك اليومية مع تصميم أنيق وسرعة استثنائية.\n\n• أداء فائق\n• مزامنة سحابية\n• حماية تامة'
    },
    iconUrl: null
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportStatusText, setExportStatusText] = useState('');
  const [renderedPreviews] = useState({});

  // Instant 0ms Mode Switching (no main thread freeze!)
  const handleSwitchMode = (newMode) => {
    setViewMode(newMode);
  };

  // Device Update Function (Using activeSceneIdRef to ensure atomic targeting)
  const updateDevice = (id, updater) => {
    const curSceneId = activeSceneIdRef.current;
    setScenes(prevScenes => prevScenes.map(sc => {
      if (sc.id === curSceneId) {
        return {
          ...sc,
          devicesList: sc.devicesList.map(d => {
            if (d.id === id) {
              const next = typeof updater === 'function' ? updater(d) : updater;
              return { ...d, ...next };
            }
            return d;
          })
        };
      }
      return sc;
    }));
  };

  const setDeviceState = (updater) => {
    const curDevId = activeDeviceIdRef.current;
    if (curDevId) {
      updateDevice(curDevId, updater);
    }
  };

  const setDevicesList = (updater) => {
    const curSceneId = activeSceneIdRef.current;
    setScenes(prev => prev.map(sc => {
      if (sc.id === curSceneId) {
        const nextList = typeof updater === 'function' ? updater(sc.devicesList) : updater;
        return { ...sc, devicesList: nextList };
      }
      return sc;
    }));
  };

  const addDevice = (configId = null, overrides = {}) => {
    const newId = `device-${Date.now()}`;
    const newIndex = devicesList.length + 1;
    const targetConfigId = configId || activeDeviceState?.configId || 'iphone-6-7';
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
      showGlare: false,
      zIndex: (devicesList.length + 1) * 10,
      ...overrides
    };

    setDevicesList(prev => [...prev, newDevice]);
    setActiveDeviceId(newId);
  };

  const removeDevice = (idToRemove) => {
    if (devicesList.length <= 1) return;
    const nextList = devicesList.filter(d => d.id !== idToRemove);
    setDevicesList(nextList);
    if (activeDeviceId === idToRemove) {
      setActiveDeviceId(nextList[0]?.id || null);
    }
  };

  const duplicateDevice = (idToDup) => {
    const dev = devicesList.find(d => d.id === idToDup);
    if (!dev) return;
    const newId = `device-${Date.now()}`;
    const dup = {
      ...dev,
      id: newId,
      name: `${dev.name} (Copy)`,
      frameX: dev.frameX + 80,
      frameY: dev.frameY + 40,
      zIndex: (devicesList.length + 1) * 10
    };
    setDevicesList(prev => [...prev, dup]);
    setActiveDeviceId(newId);
  };

  const reorderDevice = (idToMove, direction = 'up') => {
    const idx = devicesList.findIndex(d => d.id === idToMove);
    if (idx === -1) return;
    const isForward = direction === 'up' || direction === 'forward';
    const targetIdx = isForward ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= devicesList.length) return;

    const newList = [...devicesList];
    const [moved] = newList.splice(idx, 1);
    newList.splice(targetIdx, 0, moved);
    newList.forEach((d, i) => { d.zIndex = (i + 1) * 10; });
    setDevicesList(newList);
  };

  // Switch Store (Updates active scene store & format)
  const setStore = (storeId) => {
    const firstDevice = Object.values(DEVICE_CONFIGS).find(d => d.store === storeId);
    const newDeviceId = firstDevice ? firstDevice.id : currentDeviceId;
    setScenes(prev => prev.map(sc => {
      if (sc.id === activeSceneIdRef.current) {
        return {
          ...sc,
          store: storeId,
          deviceId: newDeviceId
        };
      }
      return sc;
    }));
  };

  // Switch Canvas Format Dimensions (Updates active scene format and active phone mockup)
  const switchDevice = (deviceId) => {
    const targetConfig = DEVICE_CONFIGS[deviceId];
    if (!targetConfig) return;

    setScenes(prev => prev.map(sc => {
      if (sc.id === activeSceneIdRef.current) {
        const updatedDevicesList = (sc.devicesList || []).map(d => {
          if (d.id === activeDeviceIdRef.current) {
            return {
              ...d,
              configId: deviceId,
              frameScale: targetConfig.defaultScale || 1.8,
              frameY: targetConfig.defaultY !== undefined ? targetConfig.defaultY : 320
            };
          }
          return d;
        });

        return {
          ...sc,
          deviceId,
          store: targetConfig.store || sc.store,
          devicesList: updatedDevicesList
        };
      }
      return sc;
    }));
  };

  // =========================================================================
  // COMPLETE ORIGINAL PRESETS FROM COMMIT b3dc45f (ALL 20 PRESETS)
  // =========================================================================
  const applyPreset = (presetType) => {
    const isFeature = currentDeviceId === 'play-feature-graphic';
    const isTablet = currentDeviceConfig.type.includes('tablet') || currentDeviceConfig.type === 'ipad';
    const isFold = currentDeviceConfig.type === 'android-foldable';
    const baseConfig = currentDeviceConfig.id;

    // Feature Graphic Presets
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
    const availableWidth = window.innerWidth - 440;
    const scaleH = availableHeight / canvasHeight;
    const scaleW = availableWidth / canvasWidth;
    const calculatedScale = Math.min(scaleH, scaleW);
    setViewportZoom(Math.min(Math.max(calculatedScale, 0.08), 1.0));
  };

  // Auto-fit viewport zoom on window resize
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 110;
      const availableWidth = window.innerWidth - 440;
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
              if (activeDeviceIdRef.current) {
                updateDevice(activeDeviceIdRef.current, { screenshot: evt.target.result });
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
            if (activeDeviceIdRef.current) {
              updateDevice(activeDeviceIdRef.current, { screenshot: evt.target.result });
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
  }, [activeSceneId]);

  // Multi-Format Single Slide Export (PNG / JPG)
  const handleExport = async (format = 'png') => {
    setIsExporting(true);
    const isJpg = format === 'jpg' || format === 'jpeg';
    const ext = isJpg ? 'jpg' : 'png';
    setExportStatusText(`Exporting ${ext.toUpperCase()}...`);

    const originalMode = viewMode;
    if (viewMode !== 'editor') {
      setViewMode('editor');
      await new Promise(r => setTimeout(r, 140));
    }

    let exportHost = null;
    try {
      if (document.fonts) await document.fonts.ready;
      if (!canvasRef.current) return;

      const cloneNode = canvasRef.current.cloneNode(true);
      cloneNode.querySelectorAll('.studio-ui-only').forEach(el => el.remove());
      cloneNode.querySelectorAll('.device-focus-outline').forEach(el => el.classList.remove('device-focus-outline'));
      cloneNode.querySelectorAll('.device-mockup-chassis').forEach(el => {
        const normalBorder = el.getAttribute('data-normal-border');
        const normalShadow = el.getAttribute('data-normal-shadow');
        if (normalBorder) el.style.border = normalBorder;
        if (normalShadow) el.style.boxShadow = normalShadow;
      });
      cloneNode.style.transform = 'none';
      cloneNode.style.boxShadow = 'none';

      exportHost = document.createElement('div');
      exportHost.style.position = 'fixed';
      exportHost.style.top = '0px';
      exportHost.style.left = '0px';
      exportHost.style.width = `${canvasWidth}px`;
      exportHost.style.height = `${canvasHeight}px`;
      exportHost.style.opacity = '0';
      exportHost.style.zIndex = '-99999';
      exportHost.style.pointerEvents = 'none';
      exportHost.style.overflow = 'hidden';
      exportHost.style.transform = 'none';
      exportHost.appendChild(cloneNode);

      document.body.appendChild(exportHost);
      await new Promise(r => setTimeout(r, 180));

      let dataUrl;
      if (isJpg) {
        dataUrl = await toJpeg(cloneNode, {
          quality: 0.95,
          pixelRatio: 1,
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#ffffff',
          cacheBust: false
        });
      } else {
        dataUrl = await toPng(cloneNode, {
          quality: 1,
          pixelRatio: 1,
          width: canvasWidth,
          height: canvasHeight,
          cacheBust: false
        });
      }

      const storePrefix = currentStore === STORES.PLAY_STORE ? 'google-play' : 'apple-app-store';
      const link = document.createElement('a');
      link.download = `${storePrefix}-${currentDeviceId}-${activeDeviceState.orientation}-${canvasWidth}x${canvasHeight}.${ext}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please check screenshot images.');
    } finally {
      if (exportHost && exportHost.parentNode) {
        exportHost.parentNode.removeChild(exportHost);
      }
      if (originalMode !== 'editor') {
        setViewMode(originalMode);
      }
      setIsExporting(false);
      setExportStatusText('');
    }
  };

  // Render a specific scene to a full-res data URL (PNG or JPG)
  const renderSceneToDataUrl = async (scene, format = 'png') => {
    setActiveSceneId(scene.id);
    await new Promise(r => setTimeout(r, 200));

    if (!canvasRef.current) return null;
    const cloneNode = canvasRef.current.cloneNode(true);
    cloneNode.querySelectorAll('.studio-ui-only').forEach(el => el.remove());
    cloneNode.querySelectorAll('.device-focus-outline').forEach(el => el.classList.remove('device-focus-outline'));
    cloneNode.querySelectorAll('.device-mockup-chassis').forEach(el => {
      const normalBorder = el.getAttribute('data-normal-border');
      const normalShadow = el.getAttribute('data-normal-shadow');
      if (normalBorder) el.style.border = normalBorder;
      if (normalShadow) el.style.boxShadow = normalShadow;
    });
    cloneNode.style.transform = 'none';
    cloneNode.style.boxShadow = 'none';

    const sceneConfig = DEVICE_CONFIGS[scene.deviceId || 'iphone-6-7'] || DEVICE_CONFIGS['iphone-6-7'];
    const scWidth = sceneConfig.width;
    const scHeight = sceneConfig.height;

    const exportHost = document.createElement('div');
    exportHost.style.position = 'fixed';
    exportHost.style.top = '0px';
    exportHost.style.left = '0px';
    exportHost.style.width = `${scWidth}px`;
    exportHost.style.height = `${scHeight}px`;
    exportHost.style.opacity = '0';
    exportHost.style.zIndex = '-99999';
    exportHost.style.pointerEvents = 'none';
    exportHost.appendChild(cloneNode);
    document.body.appendChild(exportHost);

    try {
      await new Promise(r => setTimeout(r, 140));
      const isJpg = format === 'jpg' || format === 'jpeg';
      if (isJpg) {
        return await toJpeg(cloneNode, {
          quality: 0.95,
          pixelRatio: 1,
          width: scWidth,
          height: scHeight,
          backgroundColor: '#ffffff'
        });
      }
      return await toPng(cloneNode, {
        quality: 1,
        pixelRatio: 1,
        width: scWidth,
        height: scHeight
      });
    } finally {
      if (exportHost.parentNode) exportHost.parentNode.removeChild(exportHost);
    }
  };

  // Export All as ZIP (Full Multi-Locale Bundle with PNG or JPG)
  const handleExportAllZip = async (format = 'png') => {
    const isJpg = format === 'jpg' || format === 'jpeg';
    const ext = isJpg ? 'jpg' : 'png';
    setIsExportingZip(true);
    setExportStatusText(`Exporting ${ext.toUpperCase()} ZIP...`);
    const originalSceneId = activeSceneId;
    const originalLocale = activeLocale;
    const originalMode = viewMode;
    setViewMode('editor');

    try {
      if (document.fonts) await document.fonts.ready;
      const zip = new JSZip();
      const storePrefix = currentStore === STORES.PLAY_STORE ? 'google-play' : 'app-store';
      const rootFolderName = `${storePrefix}-${currentDeviceId}`;

      const targetLocales = locales.length > 0 ? locales : [activeLocale];

      for (const loc of targetLocales) {
        setActiveLocale(loc);
        await new Promise(r => setTimeout(r, 80));

        const folder = targetLocales.length > 1
          ? zip.folder(`${rootFolderName}/${loc}`)
          : zip.folder(`${rootFolderName}-${loc}`);

        for (let i = 0; i < scenes.length; i++) {
          const sc = scenes[i];
          const dataUrl = await renderSceneToDataUrl(sc, ext);
          if (dataUrl) {
            const base64Data = dataUrl.split(',')[1];
            folder.file(`screenshot-${String(i + 1).padStart(2, '0')}.${ext}`, base64Data, { base64: true });
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${rootFolderName}-${ext.toUpperCase()}-screenshots.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Batch ZIP export error:', err);
      alert('Batch export failed.');
    } finally {
      setActiveLocale(originalLocale);
      setActiveSceneId(originalSceneId);
      setViewMode(originalMode);
      setIsExportingZip(false);
      setExportStatusText('');
    }
  };

  // Download All Files Individually (PNG or JPG)
  const handleDownloadAll = async (format = 'png') => {
    const isJpg = format === 'jpg' || format === 'jpeg';
    const ext = isJpg ? 'jpg' : 'png';
    setIsExportingZip(true);
    setExportStatusText(`Downloading ${ext.toUpperCase()}s...`);
    const originalSceneId = activeSceneId;
    const originalMode = viewMode;
    setViewMode('editor');

    try {
      if (document.fonts) await document.fonts.ready;
      for (let i = 0; i < scenes.length; i++) {
        const sc = scenes[i];
        const dataUrl = await renderSceneToDataUrl(sc, ext);
        if (dataUrl) {
          const link = document.createElement('a');
          link.download = `screenshot-${String(i + 1).padStart(2, '0')}-${currentDeviceId}.${ext}`;
          link.href = dataUrl;
          link.click();
          await new Promise(r => setTimeout(r, 350));
        }
      }
    } catch (err) {
      console.error('Batch export error:', err);
      alert('Export failed.');
    } finally {
      setActiveSceneId(originalSceneId);
      setViewMode(originalMode);
      setIsExportingZip(false);
      setExportStatusText('');
    }
  };

  const handleExportAllPngs = () => handleDownloadAll('png');

  // Session Backup & Restore (Full JSON Export / Import)
  const sessionFileInputRef = useRef(null);

  const handleExportSession = () => {
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const filename = `studio-session-${datePart}_${timePart}.json`;

      const sessionData = {
        app: 'app-store-studio-pro',
        version: '1.0',
        exportedAt: now.toISOString(),
        currentStore,
        currentDeviceId,
        locales,
        activeLocale,
        activeSceneId,
        activeDeviceId,
        text,
        availableFonts,
        storeMetadata,
        scenes
      };

      const jsonStr = JSON.stringify(sessionData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export session:', err);
      alert('حدث خطأ أثناء تصدير الجلسة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleImportButtonClick = () => {
    if (sessionFileInputRef.current) {
      sessionFileInputRef.current.value = '';
      sessionFileInputRef.current.click();
    }
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmMessage = 'هل أنت متأكد من استيراد هذه الجلسة؟\n\nسيتم استبدال المشروع الحالي بالكامل بالبيانات والتصميمات الموجودة داخل الملف.';
    if (!window.confirm(confirmMessage)) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (!content || typeof content !== 'string') {
          throw new Error('Empty file content');
        }

        const data = JSON.parse(content);

        // Validation: must contain scenes array
        if (!data || !Array.isArray(data.scenes) || data.scenes.length === 0) {
          alert('ملف الجلسة غير صالح أو تالف. يجب أن يحتوي الملف على شرائح صالحة.');
          return;
        }

        // Restore locales
        if (Array.isArray(data.locales) && data.locales.length > 0) {
          setLocales(data.locales);
        }
        if (data.activeLocale) {
          setActiveLocale(data.activeLocale);
        }

        // Restore custom fonts
        if (Array.isArray(data.availableFonts) && data.availableFonts.length > 0) {
          setAvailableFonts(data.availableFonts);
        }

        // Restore store metadata
        if (data.storeMetadata) {
          setStoreMetadata(data.storeMetadata);
        }

        const restoredScenes = (data.scenes || []).map((sc, idx) => {
          const baseScene = createInitialScene(sc.id || `scene-${idx + 1}`, idx + 1);
          const devId = sc.deviceId || data.currentDeviceId || 'iphone-6-7';
          return {
            ...baseScene,
            ...sc,
            deviceId: devId,
            store: sc.store || data.currentStore || STORES.APP_STORE,
            headlines: { ...baseScene.headlines, ...(sc.headlines || {}) },
            subheads: { ...baseScene.subheads, ...(sc.subheads || {}) },
            badgeText: sc.badgeText !== undefined ? sc.badgeText : (baseScene.badgeText || ''),
            textStyle: {
              ...createInitialTextStyle(),
              ...(sc.textStyle || {})
            },
            bgState: {
              ...baseScene.bgState,
              ...(sc.bgState || {})
            },
            devicesList: (Array.isArray(sc.devicesList) && sc.devicesList.length > 0)
              ? sc.devicesList.map((d, dIdx) => ({
                  ...createInitialDevice(devId),
                  ...d,
                  id: d.id || `device-${dIdx + 1}`
                }))
              : [createInitialDevice(devId)]
          };
        });
        setScenes(restoredScenes);

        // Restore active scene & device
        const targetSceneId = (data.activeSceneId && data.scenes && data.scenes.some(s => s.id === data.activeSceneId))
          ? data.activeSceneId
          : (data.scenes && data.scenes.length > 0 ? data.scenes[0].id : (restoredScenes[0]?.id || 'scene-1'));
        setActiveSceneId(targetSceneId);

        // Reset history stack on imported session with restored scenes
        setHistory([{
          scenes: restoredScenes,
          activeSceneId: targetSceneId
        }]);
        setHistoryIndex(0);

        const targetScene = (data.scenes || []).find(s => s.id === targetSceneId) || restoredScenes[0];
        const targetDeviceId = (data.activeDeviceId && targetScene?.devicesList?.some(d => d.id === data.activeDeviceId))
          ? data.activeDeviceId
          : targetScene?.devicesList?.[0]?.id || 'device-1';
        setActiveDeviceId(targetDeviceId);

        alert('تم استيراد الجلسة واستعادة كافة الشرائح والصور والنصوص بنجاح! 🎉');
      } catch (err) {
        console.error('Failed to parse or restore session:', err);
        alert('حدث خطأ أثناء قراءة الملف. يرجى التأكد من اختيار ملف JSON سليم تم تصديره من الأداة.');
      } finally {
        if (e.target) e.target.value = '';
      }
    };

    reader.onerror = () => {
      alert('تعذر قراءة الملف المختار.');
      if (e.target) e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Scene Operations for Multi-Slide Strip
  const handleAddScene = () => {
    const newId = `scene-${Date.now()}`;
    const newScene = createInitialScene(newId, scenes.length + 1, currentDeviceId, currentStore);
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newId);
    setViewMode('editor');
  };

  const handleDuplicateScene = (sceneId) => {
    const toDup = scenes.find(s => s.id === sceneId);
    if (!toDup) return;
    const newId = `scene-${Date.now()}`;
    const duplicated = {
      ...toDup,
      id: newId,
      deviceId: toDup.deviceId || currentDeviceId,
      store: toDup.store || currentStore,
      textStyle: toDup.textStyle ? { ...toDup.textStyle } : createInitialTextStyle(),
      bgState: { ...toDup.bgState },
      devicesList: toDup.devicesList.map(d => ({ ...d, id: `dev-${Date.now()}-${Math.random()}` }))
    };
    setScenes(prev => [...prev, duplicated]);
    setActiveSceneId(newId);
    setViewMode('editor');
  };

  // Action: Apply Canvas Format Dimensions to All Slides
  const handleApplyFormatToAll = () => {
    const targetDeviceId = currentDeviceId;
    const targetStore = currentStore;
    setScenes(prev => prev.map(sc => ({
      ...sc,
      deviceId: targetDeviceId,
      store: targetStore
    })));
    alert('تم تطبيق مقاس الكانفاس وأبعاده على كافة الشرائح بنجاح! ✨');
  };

  // Action: Apply Background to All Slides
  const handleApplyBgToAll = () => {
    const currentBg = activeScene.bgState;
    setScenes(prev => prev.map(sc => ({
      ...sc,
      bgState: { ...currentBg }
    })));
    alert('تم تطبيق الخلفية الحالية على كافة الشرائح بنجاح! ✨');
  };

  // Action: Apply Font & Style to All Slides
  const handleApplyFontToAll = () => {
    const styleToApply = {
      titleSize: text.titleSize,
      titleColor: text.titleColor,
      subtitleSize: text.subtitleSize,
      subtitleColor: text.subtitleColor,
      fontFamily: text.fontFamily,
      offsetY: text.offsetY,
      align: text.align
    };
    setScenes(prev => prev.map(sc => ({
      ...sc,
      textStyle: { ...(sc.textStyle || createInitialTextStyle()), ...styleToApply }
    })));
    alert('تم تطبيق الخط والتنسيق الحالي على كافة الشرائح بنجاح! ✨');
  };

  // Keyboard Nudge & Delete for Selected Phone Device
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Undo / Redo Shortcuts
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (isCmdOrCtrl && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      const currentDevId = activeDeviceIdRef.current;
      const curSceneId = activeSceneIdRef.current;
      if (!currentDevId || !curSceneId) return;

      const isShift = e.shiftKey;
      const step = isShift ? 10 : 2;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;

        setScenes(prevScenes => prevScenes.map(sc => {
          if (sc.id === curSceneId) {
            return {
              ...sc,
              devicesList: (sc.devicesList || []).map(d => {
                if (d.id === currentDevId) {
                  return {
                    ...d,
                    frameX: (d.frameX || 0) + dx,
                    frameY: (d.frameY || 0) + dy
                  };
                }
                return d;
              })
            };
          }
          return sc;
        }));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        setScenes(prevScenes => prevScenes.map(sc => {
          if (sc.id === curSceneId && sc.devicesList && sc.devicesList.length > 1) {
            const nextList = sc.devicesList.filter(d => d.id !== currentDevId);
            if (activeDeviceIdRef.current === currentDevId) {
              setActiveDeviceId(nextList[0]?.id || null);
            }
            return {
              ...sc,
              devicesList: nextList
            };
          }
          return sc;
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDeleteScene = (sceneId) => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== sceneId));
    if (activeSceneId === sceneId) {
      const rem = scenes.filter(s => s.id !== sceneId);
      setActiveSceneId(rem[0]?.id || 'scene-1');
    }
  };

  const handleMoveScene = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= scenes.length) return;
    setScenes(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
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
    applyPreset,
    // Multi-Slide Batch Actions
    scenes,
    onApplyBgToAll: handleApplyBgToAll,
    onApplyFontToAll: handleApplyFontToAll,
    onApplyFormatToAll: handleApplyFormatToAll,
    // Locales
    locales,
    activeLocale,
    onSetActiveLocale: setActiveLocale,
    onOpenLocaleModal: () => setIsLocaleModalOpen(true)
  };

  return (
    <div className="app-layout">
      {/* 1. ORIGINAL SIDEBAR CONTROLS (100% MATCHING b3dc45f) */}
      <Sidebar state={state} />

      {/* 2. MAIN STUDIO AREA */}
      <div className="studio-area">
        {/* Top Header Toolbar */}
        <div className="top-header">
          {/* Left: Branding & Compact Language Switcher */}
          <div className="app-branding">
            <div className="store-pill-indicator">
              {currentStore === STORES.PLAY_STORE ? '🤖 Play Store' : '🍎 App Store'}
            </div>
            <span className="app-title">{currentDeviceConfig.name}</span>
            <span className="badge">
              {canvasWidth} × {canvasHeight}
            </span>

            {/* Compact Language Selector Dropdown */}
            <div className="header-dropdown-container" ref={langDropdownRef}>
              <button 
                className={`header-pill-dropdown-btn ${isLangDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsLangDropdownOpen(prev => !prev)}
                title="Change or manage languages"
              >
                <span className="lang-flag">{currentLocaleObj.flag}</span>
                <span className="lang-code">{activeLocale.split('-')[0].toUpperCase()}</span>
                <ChevronDown size={12} className={`dropdown-chevron ${isLangDropdownOpen ? 'open' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="header-dropdown-menu lang-dropdown-menu">
                  <div className="dropdown-menu-header">Active Languages</div>
                  <div className="dropdown-menu-list">
                    {locales.map(code => {
                      const loc = SUPPORTED_LOCALES.find(l => l.code === code) || { flag: '🌐', name: code };
                      const isSelected = activeLocale === code;
                      return (
                        <button
                          key={code}
                          className={`dropdown-menu-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setActiveLocale(code);
                            setIsLangDropdownOpen(false);
                          }}
                        >
                          <span className="item-flag">{loc.flag}</span>
                          <span className="item-label">{loc.name}</span>
                          <span className="item-code">{code}</span>
                          {isSelected && <span className="item-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="dropdown-menu-divider" />
                  <button 
                    className="dropdown-menu-action"
                    onClick={() => {
                      setIsLocaleModalOpen(true);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <Globe size={13} />
                    <span>+ Manage Languages...</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: Clean 3-Mode Switcher */}
          <div className="mode-switcher-segmented">
            <button
              className={`mode-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('editor')}
            >
              Single Slide
            </button>
            <button
              className={`mode-btn ${viewMode === 'strip' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('strip')}
            >
              Multi-Strip ({scenes.length})
            </button>
            <button
              className={`mode-btn ${viewMode === 'mockup' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('mockup')}
            >
              Store Page
            </button>
          </div>

          {/* Right: Undo/Redo, Project Dropdown & Contextual Export */}
          <div className="top-header-right-actions">
            {/* Undo / Redo Actions */}
            <div className="undo-redo-btn-group">
              <button 
                className="header-icon-btn" 
                onClick={handleUndo} 
                disabled={!canUndo} 
                title="Undo (⌘Z / Ctrl+Z)"
              >
                <Undo2 size={15} />
              </button>
              <button 
                className="header-icon-btn" 
                onClick={handleRedo} 
                disabled={!canRedo} 
                title="Redo (⌘Y / ⌘⇧Z / Ctrl+Y)"
              >
                <Redo2 size={15} />
              </button>
            </div>

            {/* Project / Session Dropdown */}
            <div className="header-dropdown-container" ref={projectDropdownRef}>
              <button 
                className={`header-action-dropdown-btn ${isProjectDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsProjectDropdownOpen(prev => !prev)}
                title="Project Session (Export / Import)"
              >
                <FolderDown size={14} />
                <span>Project</span>
                <ChevronDown size={12} className={`dropdown-chevron ${isProjectDropdownOpen ? 'open' : ''}`} />
              </button>

              {isProjectDropdownOpen && (
                <div className="header-dropdown-menu project-dropdown-menu">
                  <div className="dropdown-menu-header">Project Session</div>
                  <button 
                    className="dropdown-menu-item project-item"
                    onClick={() => {
                      handleExportSession();
                      setIsProjectDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-circle export-icon">
                      <FileDown size={14} />
                    </div>
                    <div className="item-text-group">
                      <span className="item-title">Export Session (.json)</span>
                      <span className="item-subtitle">Download full project, images & texts</span>
                    </div>
                  </button>

                  <button 
                    className="dropdown-menu-item project-item"
                    onClick={() => {
                      handleImportButtonClick();
                      setIsProjectDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-circle import-icon">
                      <FileUp size={14} />
                    </div>
                    <div className="item-text-group">
                      <span className="item-title">Import Session (.json)</span>
                      <span className="item-subtitle">Restore project from JSON backup</span>
                    </div>
                  </button>
                </div>
              )}

              <input 
                type="file" 
                ref={sessionFileInputRef} 
                onChange={handleImportFileChange} 
                accept=".json,application/json" 
                style={{ display: 'none' }} 
              />
            </div>

            {/* Export Dropdown (Unified PNG, JPG, and ZIP) */}
            {viewMode !== 'mockup' ? (
              <ExportDropdown
                onExportSingle={(fmt) => handleExport(fmt)}
                onExportZip={(fmt) => handleExportAllZip(fmt)}
                onDownloadAll={(fmt) => handleDownloadAll(fmt)}
                isExporting={isExporting}
                isExportingZip={isExportingZip}
                exportStatusText={exportStatusText}
                activeSlideIndex={activeSceneIndex >= 0 ? activeSceneIndex : 0}
                totalSlidesCount={scenes.length}
                align="right"
              />
            ) : (
              <button 
                className="export-btn" 
                onClick={() => setViewMode('editor')}
              >
                <span>Back to Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Viewport Modes */}
        {viewMode === 'editor' && (
          <div className="clean-preview-area">
            <div
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${viewportZoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out'
              }}
            >
              <Canvas ref={canvasRef} state={state} />
            </div>

            {/* Floating Zoom Dock (Figma / Canva Style) */}
            <div className="floating-zoom-dock">
              <button className="zoom-dock-btn" onClick={() => setViewportZoom(z => Math.max(z - 0.05, 0.05))} title="Zoom Out">
                <ZoomOut size={15} />
              </button>
              <span className="zoom-dock-val">{Math.round(viewportZoom * 100)}%</span>
              <button className="zoom-dock-btn" onClick={() => setViewportZoom(z => Math.min(z + 0.05, 1.0))} title="Zoom In">
                <ZoomIn size={15} />
              </button>
              <div className="zoom-dock-divider" />
              <button className="zoom-dock-btn" onClick={fitZoomToScreen} title="Fit Screen">
                <Maximize2 size={13} />
              </button>
              
              <div className="zoom-dock-presets">
                {[0.15, 0.25, 0.5, 1.0].map(z => (
                  <button
                    key={z}
                    className={`zoom-preset-chip ${Math.abs(viewportZoom - z) < 0.03 ? 'active' : ''}`}
                    onClick={() => setViewportZoom(z)}
                  >
                    {z * 100}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'strip' && (
          <div className="strip-manager-viewport">
            <StripManager
              scenes={scenes}
              activeSceneId={activeSceneId}
              onSelectScene={(id) => {
                setActiveSceneId(id);
                setViewMode('editor');
              }}
              onAddScene={handleAddScene}
              onDuplicateScene={handleDuplicateScene}
              onDeleteScene={handleDeleteScene}
              onMoveScene={handleMoveScene}
              activeLocale={activeLocale}
              renderedPreviews={renderedPreviews}
              onExportSingle={(fmt) => handleExport(fmt)}
              onExportAllZip={(fmt) => handleExportAllZip(fmt)}
              onDownloadAll={(fmt) => handleDownloadAll(fmt)}
              onExportAllPngs={handleExportAllPngs}
              isExporting={isExporting}
              isExportingZip={isExportingZip}
              exportStatusText={exportStatusText}
              currentDeviceConfig={currentDeviceConfig}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </div>
        )}

        {viewMode === 'mockup' && (
          <div className="store-mockup-viewport">
            <StoreMockup
              store={currentStore}
              storeMetadata={storeMetadata}
              scenes={scenes}
              activeLocale={activeLocale}
              renderedPreviews={renderedPreviews}
              onSelectScene={(id) => {
                setActiveSceneId(id);
                setViewMode('editor');
              }}
              onSwitchToEditor={() => setViewMode('editor')}
              currentDeviceConfig={currentDeviceConfig}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </div>
        )}
      </div>

      {/* World Languages Modal */}
      <LocaleManagerModal
        isOpen={isLocaleModalOpen}
        onClose={() => setIsLocaleModalOpen(false)}
        locales={locales}
        activeLocale={activeLocale}
        onSetActiveLocale={setActiveLocale}
        onAddLocale={handleAddLocale}
        onRemoveLocale={handleRemoveLocale}
        scenes={scenes}
        onUpdateSceneText={handleUpdateSceneText}
      />
    </div>
  );
}
