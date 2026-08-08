import React, { useState, useRef, useEffect } from 'react';
import { Upload, Smartphone, Tablet, Palette, Type, Sliders, RotateCcw, Sparkles, Maximize, Crop, FileUp } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

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
      state.registerCustomFont(file);
    }
  };

  const colorSwatches = [
    '#0f172a', '#1e1b4b', '#311b92', '#0284c7', '#059669', 
    '#dc2626', '#d97706', '#475569', '#18181b', '#f43f5e'
  ];

  return (
    <div className="sidebar-container">
      {/* Device Mode Switcher */}
      <div className="device-switcher">
        <button 
          className={`device-btn ${state.device === 'iphone' ? 'active' : ''}`}
          onClick={() => state.switchDeviceMode('iphone')}
        >
          <Smartphone size={18} />
          iPhone App Store
        </button>
        <button 
          className={`device-btn ${state.device === 'ipad' ? 'active' : ''}`}
          onClick={() => state.switchDeviceMode('ipad')}
        >
          <Tablet size={18} />
          iPad App Store
        </button>
      </div>

      {/* Tabs */}
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

        {/* TAB 1: DEVICE & SCREENSHOT */}
        {activeTab === 'device' && (
          <div className="section-group">
            <h3 className="section-title">App Screenshot</h3>
            <label className="upload-box">
              <Upload size={20} />
              <span>{state.deviceState.screenshot ? 'Change Screenshot' : `Upload ${state.device === 'ipad' ? 'iPad' : 'iPhone'} Screenshot`}</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => state.setDeviceState(p => ({ ...p, screenshot: url })))} />
            </label>

            {/* Quick Layout Presets */}
            <h3 className="section-title mt-6">
              <Sparkles size={14} style={{ marginRight: 6, color: 'var(--accent)' }} /> 
              Instant Layout Presets
            </h3>
            <div className="preset-grid">
              <button className="preset-btn" onClick={() => state.applyPreset('centered')}>
                🌟 Centered Hero
              </button>
              <button className="preset-btn" onClick={() => state.applyPreset('bottomPeek')}>
                📱 Bottom Peek
              </button>
              <button className="preset-btn" onClick={() => state.applyPreset('slanted')}>
                📐 Slanted 3D
              </button>
              <button className="preset-btn" onClick={() => state.applyPreset('fullFit')}>
                ↔️ Full Fill
              </button>
            </div>

            {/* Device Orientation & Rotation */}
            <h3 className="section-title mt-6">Device Orientation & Rotation</h3>
            <div className="controls-box">
              <div className="control-row mb-3">
                <span className="label">Orientation</span>
                <div className="align-buttons">
                  <button 
                    className={`align-btn ${state.deviceState.orientation === 'portrait' ? 'active' : ''}`}
                    onClick={() => state.setDeviceState(p => ({ ...p, orientation: 'portrait' }))}
                  >
                    Portrait
                  </button>
                  <button 
                    className={`align-btn ${state.deviceState.orientation === 'landscape' ? 'active' : ''}`}
                    onClick={() => state.setDeviceState(p => ({ ...p, orientation: 'landscape' }))}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="control-row mt-3">
                <span className="label">Rotation Angle</span>
                <span className="value">{state.deviceState.rotation || 0}°</span>
              </div>
              <input 
                type="range" min="-180" max="180" step="1"
                value={state.deviceState.rotation || 0}
                onChange={(e) => state.setDeviceState(p => ({ ...p, rotation: parseInt(e.target.value) }))}
                className="range-input"
              />

              <div className="rotation-tags-box mt-3">
                {[0, 15, -15, 90, -90, 45, -45].map(deg => (
                  <button
                    key={deg}
                    className="pill-tag-btn"
                    onClick={() => state.setDeviceState(p => ({ ...p, rotation: deg }))}
                  >
                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            {state.deviceState.screenshot && (
              <>
                <h3 className="section-title mt-6">Screenshot Mask & Fit</h3>
                <div className="controls-box">
                  <div className="control-row mb-3">
                    <span className="label">Mask Fill Mode</span>
                    <div className="align-buttons">
                      <button 
                        className={`align-btn ${state.deviceState.fitMode === 'cover' ? 'active' : ''}`}
                        onClick={() => state.setDeviceState(p => ({ ...p, fitMode: 'cover', innerX: 0, innerY: 0, innerZoom: 1 }))}
                      >
                        <Maximize size={12} style={{ marginRight: 4 }} /> Edge-to-Edge
                      </button>
                      <button 
                        className={`align-btn ${state.deviceState.fitMode === 'contain' ? 'active' : ''}`}
                        onClick={() => state.setDeviceState(p => ({ ...p, fitMode: 'contain' }))}
                      >
                        <Crop size={12} style={{ marginRight: 4 }} /> Contain
                      </button>
                    </div>
                  </div>

                  <div className="control-row mt-3">
                    <span className="label">Screenshot Zoom</span>
                    <span className="value">{Math.round(state.deviceState.innerZoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="3" step="0.05"
                    value={state.deviceState.innerZoom}
                    onChange={(e) => state.setDeviceState(p => ({ ...p, innerZoom: parseFloat(e.target.value) }))}
                    className="range-input"
                  />

                  <div className="control-row mt-3">
                    <span className="label">Horizontal Position (X)</span>
                    <span className="value">{state.deviceState.innerX}px</span>
                  </div>
                  <input 
                    type="range" min="-500" max="500" step="2"
                    value={state.deviceState.innerX}
                    onChange={(e) => state.setDeviceState(p => ({ ...p, innerX: parseInt(e.target.value) }))}
                    className="range-input"
                  />

                  <div className="control-row mt-3">
                    <span className="label">Vertical Position (Y)</span>
                    <span className="value">{state.deviceState.innerY}px</span>
                  </div>
                  <input 
                    type="range" min="-600" max="600" step="2"
                    value={state.deviceState.innerY}
                    onChange={(e) => state.setDeviceState(p => ({ ...p, innerY: parseInt(e.target.value) }))}
                    className="range-input"
                  />

                  <button 
                    className="reset-btn"
                    onClick={() => state.setDeviceState(p => ({ ...p, fitMode: 'cover', innerZoom: 1, innerX: 0, innerY: 0 }))}
                  >
                    <RotateCcw size={14} /> Reset Edge-to-Edge
                  </button>
                </div>
              </>
            )}

            <h3 className="section-title mt-6">Device Scale & Placement on Canvas</h3>
            <div className="controls-box">
              <div className="control-row">
                <span className="label">Device Scale</span>
                <span className="value">{Math.round(state.deviceState.frameScale * 100)}%</span>
              </div>
              <input 
                type="range" min="0.5" max="3.5" step="0.05"
                value={state.deviceState.frameScale}
                onChange={(e) => state.setDeviceState(p => ({ ...p, frameScale: parseFloat(e.target.value) }))}
                className="range-input"
              />

              <div className="control-row mt-3">
                <span className="label">Vertical Position (Y)</span>
                <span className="value">{state.deviceState.frameY}px</span>
              </div>
              <input 
                type="range" min="-1200" max="1200" step="5"
                value={state.deviceState.frameY}
                onChange={(e) => state.setDeviceState(p => ({ ...p, frameY: parseInt(e.target.value) }))}
                className="range-input"
              />

              <div className="control-row mt-3">
                <span className="label">Horizontal Position (X)</span>
                <span className="value">{state.deviceState.frameX}px</span>
              </div>
              <input 
                type="range" min="-800" max="800" step="5"
                value={state.deviceState.frameX}
                onChange={(e) => state.setDeviceState(p => ({ ...p, frameX: parseInt(e.target.value) }))}
                className="range-input"
              />
            </div>
          </div>
        )}

        {/* TAB 2: BACKGROUND */}
        {activeTab === 'bg' && (
          <div className="section-group">
            <h3 className="section-title">Background Type</h3>
            <div className="bg-type-selector">
              {['color', 'gradient', 'image'].map((t) => (
                <button 
                  key={t}
                  className={`type-btn ${state.bgState.type === t ? 'active' : ''}`}
                  onClick={() => state.setBgState(p => ({ ...p, type: t }))}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* SOLID COLOR MODE */}
            {state.bgState.type === 'color' && (
              <div className="controls-box mt-4">
                <ColorPickerPopover 
                  label="Special Background Color" 
                  color={state.bgState.color} 
                  onChange={(c) => state.setBgState(p => ({ ...p, color: c }))} 
                />

                <span className="label-sm mt-4">Quick Palette Swatches</span>
                <div className="palette-grid mt-2">
                  {colorSwatches.map((hex) => (
                    <div 
                      key={hex} 
                      className="swatch-item" 
                      style={{ backgroundColor: hex }}
                      onClick={() => state.setBgState(p => ({ ...p, color: hex }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GRADIENT MODE */}
            {state.bgState.type === 'gradient' && (
              <div className="controls-box mt-4">
                <div className="row-2">
                  <ColorPickerPopover 
                    label="Color 1" 
                    color={state.bgState.color1} 
                    onChange={(c) => state.setBgState(p => ({ ...p, color1: c }))} 
                  />
                  <ColorPickerPopover 
                    label="Color 2" 
                    color={state.bgState.color2} 
                    onChange={(c) => state.setBgState(p => ({ ...p, color2: c }))} 
                  />
                </div>

                <div className="control-row mt-4">
                  <span className="label">Gradient Style</span>
                  <div className="align-buttons">
                    <button 
                      className={`align-btn ${state.bgState.gradientType === 'linear' ? 'active' : ''}`}
                      onClick={() => state.setBgState(p => ({ ...p, gradientType: 'linear' }))}
                    >
                      Linear
                    </button>
                    <button 
                      className={`align-btn ${state.bgState.gradientType === 'radial' ? 'active' : ''}`}
                      onClick={() => state.setBgState(p => ({ ...p, gradientType: 'radial' }))}
                    >
                      Radial
                    </button>
                  </div>
                </div>

                {state.bgState.gradientType === 'linear' && (
                  <>
                    <div className="control-row mt-3">
                      <span className="label">Gradient Angle</span>
                      <span className="value">{state.bgState.gradientAngle}°</span>
                    </div>
                    <input 
                      type="range" min="0" max="360" step="5"
                      value={state.bgState.gradientAngle}
                      onChange={(e) => state.setBgState(p => ({ ...p, gradientAngle: parseInt(e.target.value) }))}
                      className="range-input"
                    />
                  </>
                )}
              </div>
            )}

            {/* IMAGE MODE */}
            {state.bgState.type === 'image' && (
              <div className="mt-4">
                <label className="upload-box">
                  <Upload size={20} />
                  <span>{state.bgState.image ? 'Change Background Image' : 'Upload Background Image'}</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => state.setBgState(p => ({ ...p, image: url })))} />
                </label>

                {state.bgState.image && (
                  <div className="controls-box mt-4">
                    <div className="control-row">
                      <span className="label">Image Zoom / Crop</span>
                      <span className="value">{Math.round(state.bgState.scale * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3" step="0.05"
                      value={state.bgState.scale}
                      onChange={(e) => state.setBgState(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Horizontal Position (X)</span>
                      <span className="value">{state.bgState.posX}px</span>
                    </div>
                    <input 
                      type="range" min="-500" max="500" step="5"
                      value={state.bgState.posX}
                      onChange={(e) => state.setBgState(p => ({ ...p, posX: parseInt(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Vertical Position (Y)</span>
                      <span className="value">{state.bgState.posY}px</span>
                    </div>
                    <input 
                      type="range" min="-500" max="500" step="5"
                      value={state.bgState.posY}
                      onChange={(e) => state.setBgState(p => ({ ...p, posY: parseInt(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Background Blur</span>
                      <span className="value">{state.bgState.blur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="40" step="1"
                      value={state.bgState.blur}
                      onChange={(e) => state.setBgState(p => ({ ...p, blur: parseInt(e.target.value) }))}
                      className="range-input"
                    />

                    <div className="control-row mt-3">
                      <span className="label">Dark Overlay Tint</span>
                      <span className="value">{state.bgState.overlayOpacity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="90" step="2"
                      value={state.bgState.overlayOpacity}
                      onChange={(e) => state.setBgState(p => ({ ...p, overlayOpacity: parseInt(e.target.value) }))}
                      className="range-input"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEXT & FONTS */}
        {activeTab === 'text' && (
          <div className="section-group">
            <h3 className="section-title">Title Text</h3>
            <textarea 
              value={state.text.title} 
              onChange={(e) => state.setText(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Discover New Features"
              className="text-input"
              rows={2}
            />

            <div className="row-2 mt-3">
              <div>
                <span className="label-sm">Title Size</span>
                <input 
                  type="number" 
                  value={state.text.titleSize} 
                  onChange={(e) => state.setText(p => ({ ...p, titleSize: parseInt(e.target.value) || 20 }))}
                  className="num-input"
                />
              </div>
              <div>
                <ColorPickerPopover 
                  label="Title Color" 
                  color={state.text.titleColor} 
                  onChange={(c) => state.setText(p => ({ ...p, titleColor: c }))} 
                />
              </div>
            </div>

            <h3 className="section-title mt-6">Subtitle Text</h3>
            <textarea 
              value={state.text.subtitle} 
              onChange={(e) => state.setText(p => ({ ...p, subtitle: e.target.value }))}
              placeholder="e.g. Fast, secure and easy to use."
              className="text-input"
              rows={2}
            />

            <div className="row-2 mt-3">
              <div>
                <span className="label-sm">Subtitle Size</span>
                <input 
                  type="number" 
                  value={state.text.subtitleSize} 
                  onChange={(e) => state.setText(p => ({ ...p, subtitleSize: parseInt(e.target.value) || 16 }))}
                  className="num-input"
                />
              </div>
              <div>
                <ColorPickerPopover 
                  label="Subtitle Color" 
                  color={state.text.subtitleColor} 
                  onChange={(c) => state.setText(p => ({ ...p, subtitleColor: c }))} 
                />
              </div>
            </div>

            <h3 className="section-title mt-6">Font & Typography Settings</h3>
            <div className="controls-box">
              <div className="control-row mb-2">
                <span className="label">Font Family</span>
              </div>
              <select 
                value={state.text.fontFamily}
                onChange={(e) => state.setText(p => ({ ...p, fontFamily: e.target.value }))}
                className="select-input"
              >
                {state.availableFonts.map(f => (
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
                <span className="value">{state.text.offsetY}%</span>
              </div>
              <input 
                type="range" min="5" max="90" step="1"
                value={state.text.offsetY}
                onChange={(e) => state.setText(p => ({ ...p, offsetY: parseInt(e.target.value) }))}
                className="range-input"
              />

              <div className="control-row mt-3">
                <span className="label">Text Alignment</span>
                <div className="align-buttons">
                  {['left', 'center', 'right'].map((al) => (
                    <button 
                      key={al}
                      className={`align-btn ${state.text.align === al ? 'active' : ''}`}
                      onClick={() => state.setText(p => ({ ...p, align: al }))}
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
