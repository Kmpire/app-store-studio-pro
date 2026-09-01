import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Palette, 
  Type, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Maximize, 
  Crop, 
  FileUp,
  Copy,
  Trash2,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { STORES, DEVICE_CONFIGS, FRAME_FINISHES, CAMERA_STYLES, STORE_GRADIENT_PRESETS } from '../constants/storeConfigs';

const ColorPickerPopover = ({ label, color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popover.current && !popover.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && <span className="label-sm">{label}</span>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div 
          style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '8px', 
            backgroundColor: color, 
            border: '2px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            flexShrink: 0
          }} 
          onClick={() => setIsOpen(!isOpen)}
        />
        <input 
          type="text" 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="num-input"
          style={{ fontFamily: 'monospace', fontSize: '13px' }}
        />
        
        {isOpen && (
          <div ref={popover} style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '8px' }}>
            <div style={{ padding: '12px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.6)' }}>
              <HexColorPicker color={color} onChange={onChange} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Sidebar({ state }) {
  const [activeTab, setActiveTab] = useState('device');

  const {
    currentStore,
    setStore,
    currentDeviceId,
    switchDevice,
    currentDeviceConfig,
    devicesList = [],
    activeDeviceId,
    setActiveDeviceId,
    deviceState,
    setDeviceState,
    updateDevice,
    addDevice,
    removeDevice,
    duplicateDevice,
    reorderDevice,
    bgState,
    setBgState,
    text,
    setText,
    availableFonts,
    registerCustomFont,
    applyPreset
  } = state;

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => callback(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      registerCustomFont(file);
    }
  };

  const currentStoreDevices = Object.values(DEVICE_CONFIGS).filter(
    d => d.store === currentStore
  );

  const isPlayStore = currentStore === STORES.PLAY_STORE;
  const [presetCategory, setPresetCategory] = useState('auto');
  const activePresetCategory = presetCategory === 'auto'
    ? (devicesList.length <= 1 ? '1-phone' : devicesList.length === 2 ? '2-phones' : '3-phones')
    : presetCategory;

  const isFeatureGraphic = currentDeviceId === 'play-feature-graphic';

  const colorSwatches = [
    '#0f172a', '#1e1b4b', '#311b92', '#0284c7', '#059669', 
    '#dc2626', '#d97706', '#475569', '#18181b', '#f43f5e'
  ];

  return (
    <div className="sidebar-container">
      {/* 1. TOP STORE SWITCHER */}
      <div className="store-switcher-bar">
        <button
          className={`store-tab-btn ${currentStore === STORES.APP_STORE ? 'active apple' : ''}`}
          onClick={() => setStore(STORES.APP_STORE)}
        >
          <span className="store-icon">🍎</span>
          <div className="store-tab-info">
            <span className="store-title">Apple App Store</span>
            <span className="store-sub">iOS & iPadOS</span>
          </div>
        </button>

        <button
          className={`store-tab-btn ${currentStore === STORES.PLAY_STORE ? 'active google' : ''}`}
          onClick={() => setStore(STORES.PLAY_STORE)}
        >
          <span className="store-icon">🤖</span>
          <div className="store-tab-info">
            <span className="store-title">Google Play Store</span>
            <span className="store-sub">Android & Tablets</span>
          </div>
        </button>
      </div>

      {/* 2. DEVICE / FORMAT SELECTOR */}
      <div className="device-selection-area">
        <label className="label-sm mb-1">Select Canvas Format Dimensions</label>
        <div className="device-pills-scroll">
          {currentStoreDevices.map(d => (
            <button
              key={d.id}
              className={`device-pill-btn ${currentDeviceId === d.id ? 'active' : ''}`}
              onClick={() => switchDevice(d.id)}
            >
              <span className="pill-name">{d.name}</span>
              <span className="pill-badge">{d.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'device' ? 'active' : ''}`} onClick={() => setActiveTab('device')}>
          <Sliders size={16} /> Device & Screen
        </button>
        <button className={`nav-tab ${activeTab === 'bg' ? 'active' : ''}`} onClick={() => setActiveTab('bg')}>
          <Palette size={16} /> Background
        </button>
        <button className={`nav-tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
          <Type size={16} /> Text & Fonts
        </button>
      </div>

      <div className="tab-content">

        {/* ========================================================================= */}
        {/* TAB 1: DEVICE & SCREENSHOT CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === 'device' && (
          <div className="section-group">

            {/* MULTI-DEVICE MANAGER */}
            <div className="multi-device-box mb-4">
              <div className="flex-between mb-2">
                <span className="section-title mb-0" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="var(--accent)" /> Phone Mockups ({devicesList.length})
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    className="add-phone-btn"
                    onClick={() => addDevice('iphone-6-7')}
                    title="Add an Apple iPhone mockup"
                  >
                    + 🍎 iPhone
                  </button>
                  <button
                    className="add-phone-btn"
                    onClick={() => addDevice('android-phone')}
                    title="Add a Google Android flagship mockup"
                  >
                    + 🤖 Android
                  </button>
                </div>
              </div>

              {/* Multi-Device Tabs */}
              <div className="multi-device-tab-bar">
                {devicesList.map((dev) => {
                  const isActive = activeDeviceId === dev.id;
                  return (
                    <button
                      key={dev.id}
                      className={`multi-device-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveDeviceId(dev.id)}
                    >
                      <span>📱</span>
                      <span className="tab-dev-name">{dev.name}</span>
                      {devicesList.length > 1 && (
                        <span
                          className="tab-dev-remove"
                          title="Remove phone"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDevice(dev.id);
                          }}
                        >
                          ×
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions for Active Device */}
              <div className="active-dev-toolbar mt-2">
                <button
                  className="dev-action-btn"
                  onClick={() => duplicateDevice(activeDeviceId)}
                  title="Duplicate this phone"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button
                  className="dev-action-btn"
                  onClick={() => reorderDevice(activeDeviceId, 'forward')}
                  title="Bring forward in layer order"
                >
                  <ArrowUp size={12} /> Forward
                </button>
                <button
                  className="dev-action-btn"
                  onClick={() => reorderDevice(activeDeviceId, 'backward')}
                  title="Send backward in layer order"
                >
                  <ArrowDown size={12} /> Backward
                </button>
                {devicesList.length > 1 && (
                  <button
                    className="dev-action-btn danger"
                    onClick={() => removeDevice(activeDeviceId)}
                    title="Delete this phone"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>

              {/* Active Phone Model Switcher */}
              <div className="control-row mt-3 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span className="label" style={{ fontSize: '11px' }}>Selected Phone Model</span>
                <select
                  className="select-input"
                  style={{ width: '185px', fontSize: '11px', padding: '4px 8px' }}
                  value={deviceState.configId || currentDeviceId}
                  onChange={(e) => {
                    const newConfigId = e.target.value;
                    const targetCfg = DEVICE_CONFIGS[newConfigId];
                    updateDevice(activeDeviceId, {
                      configId: newConfigId,
                      frameScale: targetCfg?.defaultScale || deviceState.frameScale || 1.8,
                      frameY: targetCfg?.defaultY !== undefined ? targetCfg.defaultY : deviceState.frameY
                    });
                  }}
                >
                  <optgroup label="🍎 Apple App Store Devices">
                    {Object.values(DEVICE_CONFIGS).filter(d => d.store === STORES.APP_STORE).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🤖 Google Play Store Devices">
                    {Object.values(DEVICE_CONFIGS).filter(d => d.store === STORES.PLAY_STORE).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Quick Layout Presets */}
            <div className="flex-between mt-3 mb-2">
              <h3 className="section-title mb-0" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--accent)" /> Instant Layout Presets
              </h3>
            </div>

            {/* Dynamic Preset Category Filter Chips */}
            {!isFeatureGraphic && (
              <div className="preset-chips-row">
                <button
                  className={`preset-chip ${presetCategory === 'auto' ? 'active' : ''}`}
                  onClick={() => setPresetCategory('auto')}
                  title="Automatically show presets matching current number of phones"
                >
                  ⚡ Auto ({devicesList.length} Phone{devicesList.length > 1 ? 's' : ''})
                </button>
                <button
                  className={`preset-chip ${presetCategory === '1-phone' ? 'active' : ''}`}
                  onClick={() => setPresetCategory('1-phone')}
                >
                  📱 1 Phone
                </button>
                <button
                  className={`preset-chip ${presetCategory === '2-phones' ? 'active' : ''}`}
                  onClick={() => setPresetCategory('2-phones')}
                >
                  📱📱 2 Phones
                </button>
                <button
                  className={`preset-chip ${presetCategory === '3-phones' ? 'active' : ''}`}
                  onClick={() => setPresetCategory('3-phones')}
                >
                  🌟 3+ Phones
                </button>
                <button
                  className={`preset-chip ${presetCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setPresetCategory('all')}
                >
                  All
                </button>
              </div>
            )}

            <div className="preset-grid">
              {isFeatureGraphic ? (
                <>
                  <button className="preset-btn" onClick={() => applyPreset('bannerRight')}>
                    📐 1 Mockup Right
                  </button>
                  <button className="preset-btn" onClick={() => applyPreset('bannerDualRight')}>
                    📱📱 2 Mockups Banner
                  </button>
                  <button className="preset-btn" onClick={() => applyPreset('bannerCenter')}>
                    🌟 Centered Showcase
                  </button>
                  <button className="preset-btn" onClick={() => applyPreset('bannerSlanted')}>
                    🚀 3D Angled Hero
                  </button>
                  <button className="preset-btn" onClick={() => applyPreset('bannerTextOnly')}>
                    📝 Clean Title Only
                  </button>
                </>
              ) : (
                <>
                  {/* Single Phone Presets */}
                  {(activePresetCategory === '1-phone' || activePresetCategory === 'all') && (
                    <>
                      <button className="preset-btn" onClick={() => applyPreset('centered')}>
                        🌟 Centered Hero
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('bottomPeek')}>
                        📱 Bottom Peek
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('slanted')}>
                        📐 Slanted Left (-12°)
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('slantedRight')}>
                        📐 Slanted Right (+12°)
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('fullFit')}>
                        ↔️ Full Fill
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('floatingHero')}>
                        🚀 Floating Hero
                      </button>
                    </>
                  )}

                  {/* Dual Phone Presets */}
                  {(activePresetCategory === '2-phones' || activePresetCategory === 'all') && (
                    <>
                      <button className="preset-btn" onClick={() => applyPreset('dualSide')}>
                        📱📱 2 Side-by-Side
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('dualOverlap')}>
                        📐 2 3D Overlapping
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('dualPerspective')}>
                        🚀 2 Perspective Angled
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('crossPlatformDuo')}>
                        🍏🤖 iOS + Android Duo
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('bottomPeekDual')}>
                        📱📱 2 Bottom Peek
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('dualFloating')}>
                        🚀 2 Floating Duo
                      </button>
                    </>
                  )}

                  {/* Triple / Multi Phone Presets */}
                  {(activePresetCategory === '3-phones' || activePresetCategory === 'all') && (
                    <>
                      <button className="preset-btn" onClick={() => applyPreset('tripleShowcase')}>
                        🌟 3 Phones Showcase
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('tripleOverlap')}>
                        📐 3 Cascade Overlap
                      </button>
                      <button className="preset-btn" onClick={() => applyPreset('tripleSide')}>
                        📱📱📱 3 Flat Columns
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Active Phone Screenshot Upload */}
            <h3 className="section-title mt-6">
              Screenshot ({deviceState.name || 'Selected Phone'})
            </h3>
            <label className="upload-box">
              <Upload size={20} />
              <span>{deviceState.screenshot ? `Change ${deviceState.name || 'Phone'} Screenshot` : `Upload ${deviceState.name || 'Phone'} Screenshot`}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, (url) => setDeviceState(p => ({ ...p, screenshot: url })))} 
              />
            </label>

            {/* Device Chassis Finish & Colors */}
            <h3 className="section-title mt-6">Device Chassis & Finish</h3>
            <div className="controls-box">
              <span className="label-sm mb-2">Frame Material Finish</span>
              <div className="finish-grid">
                {FRAME_FINISHES.map(f => (
                  <button
                    key={f.id}
                    className={`finish-card ${deviceState.frameFinishId === f.id ? 'active' : ''}`}
                    onClick={() => setDeviceState(p => ({ ...p, frameFinishId: f.id }))}
                  >
                    <div 
                      className="finish-swatch"
                      style={{ background: f.metallic || f.color, border: `1px solid ${f.border}` }}
                    />
                    <span className="finish-label">{f.name}</span>
                  </button>
                ))}
              </div>

              {deviceState.frameFinishId === 'custom' && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <ColorPickerPopover 
                    label="Custom Frame Color" 
                    color={deviceState.customFrameColor || '#2d2d32'} 
                    onChange={(c) => setDeviceState(p => ({ ...p, customFrameColor: c }))} 
                  />
                </div>
              )}

              {/* Android Notch / Punch-hole Selection */}
              {isPlayStore && !isFeatureGraphic && (
                <div className="control-row mt-4">
                  <span className="label">Punch-Hole Camera</span>
                  <select
                    className="select-input"
                    style={{ width: '180px' }}
                    value={deviceState.cameraStyleOverride || currentDeviceConfig?.cameraStyle || 'punch-hole-center'}
                    onChange={(e) => setDeviceState(p => ({ ...p, cameraStyleOverride: e.target.value }))}
                  >
                    {CAMERA_STYLES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Glass Glare Reflection Toggle */}
              <div className="control-row mt-3">
                <span className="label">Glass Specular Glare</span>
                <button
                  className={`align-btn ${deviceState.showGlare ? 'active' : ''}`}
                  onClick={() => setDeviceState(p => ({ ...p, showGlare: !p.showGlare }))}
                >
                  {deviceState.showGlare ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Shadow Intensity */}
              <div className="control-row mt-3">
                <span className="label">Drop Shadow Intensity</span>
                <span className="value">{Math.round((deviceState.shadowIntensity ?? 0.5) * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={deviceState.shadowIntensity ?? 0.5}
                onChange={(e) => setDeviceState(p => ({ ...p, shadowIntensity: parseFloat(e.target.value) }))}
                className="range-input"
              />
            </div>

            {/* Device Orientation & Rotation */}
            <h3 className="section-title mt-6">Orientation & Rotation</h3>
            <div className="controls-box">
              <div className="control-row mb-3">
                <span className="label">Orientation</span>
                <div className="align-buttons">
                  <button 
                    className={`align-btn ${deviceState.orientation === 'portrait' ? 'active' : ''}`}
                    onClick={() => setDeviceState(p => ({ ...p, orientation: 'portrait' }))}
                  >
                    Portrait
                  </button>
                  <button 
                    className={`align-btn ${deviceState.orientation === 'landscape' ? 'active' : ''}`}
                    onClick={() => setDeviceState(p => ({ ...p, orientation: 'landscape' }))}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="control-row mt-3">
                <span className="label">Rotation Angle</span>
                <span className="value">{deviceState.rotation || 0}°</span>
              </div>
              <input 
                type="range" min="-180" max="180" step="1"
                value={deviceState.rotation || 0}
                onChange={(e) => setDeviceState(p => ({ ...p, rotation: parseInt(e.target.value) }))}
                className="range-input"
              />

              <div className="rotation-tags-box mt-3">
                {[0, 15, -15, 90, -90, 45, -45].map(deg => (
                  <button
                    key={deg}
                    className="pill-tag-btn"
                    onClick={() => setDeviceState(p => ({ ...p, rotation: deg }))}
                  >
                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            {/* Screenshot Mask & Inner Fit */}
            {deviceState.screenshot && (
              <>
                <h3 className="section-title mt-6">Screenshot Mask & Inner Fit</h3>
                <div className="controls-box">
                  <div className="control-row mb-3">
                    <span className="label">Mask Fill Mode</span>
                    <div className="align-buttons">
                      <button 
                        className={`align-btn ${deviceState.fitMode === 'cover' ? 'active' : ''}`}
                        onClick={() => setDeviceState(p => ({ ...p, fitMode: 'cover', innerX: 0, innerY: 0, innerZoom: 1 }))}
                      >
                        <Maximize size={12} style={{ marginRight: 4 }} /> Edge-to-Edge
                      </button>
                      <button 
                        className={`align-btn ${deviceState.fitMode === 'contain' ? 'active' : ''}`}
                        onClick={() => setDeviceState(p => ({ ...p, fitMode: 'contain' }))}
                      >
                        <Crop size={12} style={{ marginRight: 4 }} /> Contain
                      </button>
                    </div>
                  </div>

                  <div className="control-row mt-3">
                    <span className="label">Screenshot Zoom</span>
                    <span className="value">{Math.round((deviceState.innerZoom || 1) * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="3" step="0.05"
                    value={deviceState.innerZoom || 1}
                    onChange={(e) => setDeviceState(p => ({ ...p, innerZoom: parseFloat(e.target.value) }))}
                    className="range-input"
                  />

                  <div className="control-row mt-3">
                    <span className="label">Screenshot Pan (X)</span>
                    <span className="value">{deviceState.innerX || 0}px</span>
                  </div>
                  <input 
                    type="range" min="-500" max="500" step="2"
                    value={deviceState.innerX || 0}
                    onChange={(e) => setDeviceState(p => ({ ...p, innerX: parseInt(e.target.value) }))}
                    className="range-input"
                  />

                  <div className="control-row mt-3">
                    <span className="label">Screenshot Pan (Y)</span>
                    <span className="value">{deviceState.innerY || 0}px</span>
                  </div>
                  <input 
                    type="range" min="-600" max="600" step="2"
                    value={deviceState.innerY || 0}
                    onChange={(e) => setDeviceState(p => ({ ...p, innerY: parseInt(e.target.value) }))}
                    className="range-input"
                  />

                  <button 
                    className="reset-btn"
                    onClick={() => setDeviceState(p => ({ ...p, fitMode: 'cover', innerZoom: 1, innerX: 0, innerY: 0 }))}
                  >
                    <RotateCcw size={14} /> Reset Inner Fit
                  </button>
                </div>
              </>
            )}

            {/* Device Canvas Scale & Placement */}
            <h3 className="section-title mt-6">Device Scale & Canvas Position</h3>
            <div className="controls-box">
              <div className="control-row">
                <span className="label">Device Scale</span>
                <span className="value">{Math.round((deviceState.frameScale || 1) * 100)}%</span>
              </div>
              <input 
                type="range" min="0.3" max="3.5" step="0.05"
                value={deviceState.frameScale || 1}
                onChange={(e) => setDeviceState(p => ({ ...p, frameScale: parseFloat(e.target.value) }))}
                className="range-input"
              />

              <div className="control-row mt-3">
                <span className="label">Vertical Position (Y)</span>
                <span className="value">{deviceState.frameY || 0}px</span>
              </div>
              <input 
                type="range" min="-1200" max="1200" step="5"
                value={deviceState.frameY || 0}
                onChange={(e) => setDeviceState(p => ({ ...p, frameY: parseInt(e.target.value) }))}
                className="range-input"
              />

              <div className="control-row mt-3">
                <span className="label">Horizontal Position (X)</span>
                <span className="value">{deviceState.frameX || 0}px</span>
              </div>
              <input 
                type="range" min="-800" max="800" step="5"
                value={deviceState.frameX || 0}
                onChange={(e) => setDeviceState(p => ({ ...p, frameX: parseInt(e.target.value) }))}
                className="range-input"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BACKGROUND CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === 'bg' && (
          <div className="section-group">
            <h3 className="section-title">Background Type</h3>
            <div className="bg-type-selector">
              {['gradient', 'color', 'image'].map((t) => (
                <button 
                  key={t}
                  className={`type-btn ${bgState.type === t ? 'active' : ''}`}
                  onClick={() => setBgState(p => ({ ...p, type: t }))}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Curated Store Gradient Presets */}
            {bgState.type === 'gradient' && (
              <>
                <span className="label-sm mt-4">Curated Gradient Presets</span>
                <div className="gradient-presets-grid mt-2">
                  {STORE_GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      className="gradient-preset-chip"
                      style={{ background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})` }}
                      onClick={() => setBgState(p => ({
                        ...p,
                        color1: preset.color1,
                        color2: preset.color2,
                        gradientAngle: preset.angle || 135
                      }))}
                      title={preset.name}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* SOLID COLOR MODE */}
            {bgState.type === 'color' && (
              <div className="controls-box mt-4">
                <ColorPickerPopover 
                  label="Special Background Color" 
                  color={bgState.color} 
                  onChange={(c) => setBgState(p => ({ ...p, color: c }))} 
                />

                <span className="label-sm mt-4">Quick Palette Swatches</span>
                <div className="palette-grid mt-2">
                  {colorSwatches.map((hex) => (
                    <div 
                      key={hex} 
                      className="swatch-item" 
                      style={{ backgroundColor: hex }}
                      onClick={() => setBgState(p => ({ ...p, color: hex }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GRADIENT MODE */}
            {bgState.type === 'gradient' && (
              <div className="controls-box mt-4">
                <div className="row-2">
                  <ColorPickerPopover 
                    label="Color 1" 
                    color={bgState.color1} 
                    onChange={(c) => setBgState(p => ({ ...p, color1: c }))} 
                  />
                  <ColorPickerPopover 
                    label="Color 2" 
                    color={bgState.color2} 
                    onChange={(c) => setBgState(p => ({ ...p, color2: c }))} 
                  />
                </div>

                <div className="control-row mt-4">
                  <span className="label">Gradient Style</span>
                  <div className="align-buttons">
                    <button 
                      className={`align-btn ${bgState.gradientType === 'linear' ? 'active' : ''}`}
                      onClick={() => setBgState(p => ({ ...p, gradientType: 'linear' }))}
                    >
                      Linear
                    </button>
                    <button 
                      className={`align-btn ${bgState.gradientType === 'radial' ? 'active' : ''}`}
                      onClick={() => setBgState(p => ({ ...p, gradientType: 'radial' }))}
                    >
                      Radial
                    </button>
                  </div>
                </div>

                {bgState.gradientType === 'linear' && (
                  <>
                    <div className="control-row mt-3">
                      <span className="label">Gradient Angle</span>
                      <span className="value">{bgState.gradientAngle}°</span>
                    </div>
                    <input 
                      type="range" min="0" max="360" step="5"
                      value={bgState.gradientAngle}
                      onChange={(e) => setBgState(p => ({ ...p, gradientAngle: parseInt(e.target.value) }))}
                      className="range-input"
                    />
                  </>
                )}
              </div>
            )}

            {/* IMAGE MODE */}
            {bgState.type === 'image' && (
              <div className="mt-4">
                <label className="upload-box">
                  <Upload size={20} />
                  <span>{bgState.image ? 'Change Background Image' : 'Upload Background Image'}</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setBgState(p => ({ ...p, image: url })))} />
                </label>

                {bgState.image && (
                  <div className="controls-box mt-4">
                    <div className="control-row">
                      <span className="label">Image Zoom</span>
                      <span className="value">{Math.round(bgState.scale * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3" step="0.05"
                      value={bgState.scale}
                      onChange={(e) => setBgState(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Horizontal Position (X)</span>
                      <span className="value">{bgState.posX}px</span>
                    </div>
                    <input 
                      type="range" min="-500" max="500" step="5"
                      value={bgState.posX}
                      onChange={(e) => setBgState(p => ({ ...p, posX: parseInt(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Vertical Position (Y)</span>
                      <span className="value">{bgState.posY}px</span>
                    </div>
                    <input 
                      type="range" min="-500" max="500" step="5"
                      value={bgState.posY}
                      onChange={(e) => setBgState(p => ({ ...p, posY: parseInt(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Background Blur</span>
                      <span className="value">{bgState.blur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="40" step="1"
                      value={bgState.blur}
                      onChange={(e) => setBgState(p => ({ ...p, blur: parseInt(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Dark Overlay Tint</span>
                      <span className="value">{bgState.overlayOpacity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="90" step="2"
                      value={bgState.overlayOpacity}
                      onChange={(e) => setBgState(p => ({ ...p, overlayOpacity: parseInt(e.target.value) }))}
                      className="range-input"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TEXT & FONTS CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === 'text' && (
          <div className="section-group">
            {/* Optional Tagline / Badge Text */}
            <h3 className="section-title">Badge Tagline (Optional)</h3>
            <input
              type="text"
              value={text.badgeText || ''}
              onChange={(e) => setText(p => ({ ...p, badgeText: e.target.value }))}
              placeholder="e.g. Featured on Google Play / #1 App"
              className="num-input mb-3"
            />

            {/* Title Text */}
            <h3 className="section-title">Title Headline</h3>
            <textarea 
              value={text.title} 
              onChange={(e) => setText(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Experience The Next Gen App"
              className="text-input"
              rows={2}
            />

            <div className="row-2 mt-3">
              <div>
                <span className="label-sm">Title Font Size</span>
                <input 
                  type="number" 
                  value={text.titleSize} 
                  onChange={(e) => setText(p => ({ ...p, titleSize: parseInt(e.target.value) || 20 }))}
                  className="num-input"
                />
              </div>
              <div>
                <ColorPickerPopover 
                  label="Title Color" 
                  color={text.titleColor} 
                  onChange={(c) => setText(p => ({ ...p, titleColor: c }))} 
                />
              </div>
            </div>

            {/* Subtitle Text */}
            <h3 className="section-title mt-6">Subtitle Text</h3>
            <textarea 
              value={text.subtitle} 
              onChange={(e) => setText(p => ({ ...p, subtitle: e.target.value }))}
              placeholder="e.g. Fast, secure and designed for your Android devices."
              className="text-input"
              rows={2}
            />

            <div className="row-2 mt-3">
              <div>
                <span className="label-sm">Subtitle Font Size</span>
                <input 
                  type="number" 
                  value={text.subtitleSize} 
                  onChange={(e) => setText(p => ({ ...p, subtitleSize: parseInt(e.target.value) || 16 }))}
                  className="num-input"
                />
              </div>
              <div>
                <ColorPickerPopover 
                  label="Subtitle Color" 
                  color={text.subtitleColor} 
                  onChange={(c) => setText(p => ({ ...p, subtitleColor: c }))} 
                />
              </div>
            </div>

            {/* Font & Typography Settings */}
            <h3 className="section-title mt-6">Font & Typography Settings</h3>
            <div className="controls-box">
              <div className="control-row mb-2">
                <span className="label">Font Family</span>
              </div>
              <select 
                value={text.fontFamily}
                onChange={(e) => setText(p => ({ ...p, fontFamily: e.target.value }))}
                className="select-input"
              >
                {availableFonts.map(f => (
                  <option key={f.value} value={f.value}>{f.name}</option>
                ))}
              </select>

              {/* Upload Custom Font File */}
              <label className="upload-box mt-3" style={{ padding: '14px' }}>
                <FileUp size={16} />
                <span style={{ fontSize: '12px' }}>Upload Custom Font File (.ttf, .otf, .woff)</span>
                <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} />
              </label>

              <div className="control-row mt-4">
                <span className="label">Text Position (Y)</span>
                <span className="value">{text.offsetY}%</span>
              </div>
              <input 
                type="range" min="5" max="95" step="1"
                value={text.offsetY}
                onChange={(e) => setText(p => ({ ...p, offsetY: parseInt(e.target.value) }))}
                className="range-input"
              />

              <div className="control-row mt-3">
                <span className="label">Text Alignment</span>
                <div className="align-buttons">
                  {['left', 'center', 'right'].map((al) => (
                    <button 
                      key={al}
                      className={`align-btn ${text.align === al ? 'active' : ''}`}
                      onClick={() => setText(p => ({ ...p, align: al }))}
                    >
                      {al}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
