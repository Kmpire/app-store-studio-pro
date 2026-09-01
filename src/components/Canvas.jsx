import React, { forwardRef, useState, useEffect } from 'react';
import DeviceMockup from './DeviceMockup';

const Canvas = forwardRef(({ state }, ref) => {
  const { 
    currentDeviceConfig,
    canvasWidth,
    canvasHeight,
    bgState,
    text,
    setText,
    deviceState,
    setDeviceState
  } = state;

  const [isDraggingDevice, setIsDraggingDevice] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [editingField, setEditingField] = useState(null); // 'badge' | 'title' | 'subtitle' | null

  // Background styling
  const renderBackgroundLayer = () => {
    if (bgState.type === 'color') {
      return (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: bgState.color }} />
      );
    }
    if (bgState.type === 'gradient') {
      const gradCss = bgState.gradientType === 'radial'
        ? `radial-gradient(circle at center, ${bgState.color1} 0%, ${bgState.color2} 100%)`
        : `linear-gradient(${bgState.gradientAngle}deg, ${bgState.color1} 0%, ${bgState.color2} 100%)`;

      return (
        <div style={{ position: 'absolute', inset: 0, background: gradCss }} />
      );
    }
    if (bgState.type === 'image' && bgState.image) {
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img
            src={bgState.image}
            alt="Background"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translate(-50%, -50%) translate(${bgState.posX}px, ${bgState.posY}px) scale(${bgState.scale})`,
              filter: `blur(${bgState.blur}px)`
            }}
          />
          {/* Overlay Darkening Tint */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: bgState.overlayColor || '#000000',
              opacity: (bgState.overlayOpacity || 0) / 100
            }}
          />
        </div>
      );
    }
    return <div style={{ position: 'absolute', inset: 0, backgroundColor: '#0f172a' }} />;
  };

  const handleMouseDown = (e) => {
    if (editingField) return;
    e.stopPropagation();
    setIsDraggingDevice(true);
    setDragStart({
      x: e.clientX - (deviceState.frameX || 0),
      y: e.clientY - (deviceState.frameY || 0)
    });
  };

  const handleMouseMove = (e) => {
    if (!isDraggingDevice) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setDeviceState(prev => ({ ...prev, frameX: newX, frameY: newY }));
  };

  const handleMouseUp = () => {
    setIsDraggingDevice(false);
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setDeviceState(prev => ({ ...prev, screenshot: evt.target.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const isFeatureGraphic = currentDeviceConfig?.type === 'feature-graphic';

  return (
    <div
      ref={ref}
      className="canvas-box"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
        boxSizing: 'border-box',
        borderRadius: '16px',
        backgroundColor: '#0a0d14'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (editingField) setEditingField(null);
      }}
    >
      {/* Background Layer */}
      {renderBackgroundLayer()}

      {/* Decorative Ambient Light Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          borderRadius: '50%'
        }} 
      />

      {/* Text Section */}
      {(text.title || text.subtitle || text.badgeText || editingField) && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: isFeatureGraphic && text.align === 'left' ? '40%' : 0,
            top: `${text.offsetY}%`,
            transform: 'translateY(-50%)',
            padding: isFeatureGraphic ? '0 50px' : '0 8%',
            textAlign: text.align,
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          {/* Optional App / Feature Badge */}
          {(text.badgeText || editingField === 'badge') && (
            <div 
              style={{ marginBottom: '14px', pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {editingField === 'badge' ? (
                <input
                  type="text"
                  autoFocus
                  value={text.badgeText || ''}
                  onChange={(e) => setText(p => ({ ...p, badgeText: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setEditingField(null);
                    }
                  }}
                  placeholder="Badge text..."
                  style={{
                    display: 'inline-block',
                    padding: '6px 18px',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '24px',
                    color: '#ffffff',
                    fontSize: `${Math.round((text.titleSize || 60) * 0.32)}px`,
                    fontFamily: text.fontFamily,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
                    outline: 'none',
                    textAlign: text.align,
                    maxWidth: '85%'
                  }}
                />
              ) : (
                <span
                  className="editable-canvas-text"
                  title="Double-click to edit tagline"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingField('badge');
                  }}
                  style={{
                    display: 'inline-block',
                    padding: '6px 18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '24px',
                    color: '#ffffff',
                    fontSize: `${Math.round((text.titleSize || 60) * 0.32)}px`,
                    fontFamily: text.fontFamily,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'text',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                >
                  {text.badgeText}
                </span>
              )}
            </div>
          )}

          {/* Title Headline */}
          {(text.title || editingField === 'title') && (
            <div
              style={{ pointerEvents: 'auto', marginBottom: text.subtitle ? '18px' : '0' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {editingField === 'title' ? (
                <textarea
                  autoFocus
                  value={text.title}
                  onChange={(e) => setText(p => ({ ...p, title: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingField(null);
                    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      setEditingField(null);
                    }
                  }}
                  placeholder="Headline title..."
                  rows={Math.max((text.title || '').split('\n').length, 1)}
                  style={{
                    width: '100%',
                    fontSize: `${text.titleSize}px`,
                    color: text.titleColor,
                    fontFamily: text.fontFamily,
                    fontWeight: text.fontWeight || 800,
                    lineHeight: 1.15,
                    textAlign: text.align,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    outline: 'none',
                    resize: 'none',
                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <h1
                  className="editable-canvas-text"
                  title="Double-click to edit title"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingField('title');
                  }}
                  style={{
                    fontSize: `${text.titleSize}px`,
                    color: text.titleColor,
                    fontFamily: text.fontFamily,
                    fontWeight: text.fontWeight || 800,
                    lineHeight: 1.15,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    textShadow: '0 6px 20px rgba(0,0,0,0.5)',
                    cursor: 'text',
                    borderRadius: '8px',
                    padding: '4px 6px',
                    display: 'inline-block',
                    maxWidth: '100%'
                  }}
                >
                  {text.title}
                </h1>
              )}
            </div>
          )}

          {/* Subtitle Text */}
          {(text.subtitle || editingField === 'subtitle') && (
            <div
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {editingField === 'subtitle' ? (
                <textarea
                  autoFocus
                  value={text.subtitle}
                  onChange={(e) => setText(p => ({ ...p, subtitle: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingField(null);
                    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      setEditingField(null);
                    }
                  }}
                  placeholder="Subtitle description..."
                  rows={Math.max((text.subtitle || '').split('\n').length, 1)}
                  style={{
                    width: '100%',
                    fontSize: `${text.subtitleSize}px`,
                    color: text.subtitleColor,
                    fontFamily: text.fontFamily,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    textAlign: text.align,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    outline: 'none',
                    resize: 'none',
                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p
                  className="editable-canvas-text"
                  title="Double-click to edit subtitle"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingField('subtitle');
                  }}
                  style={{
                    fontSize: `${text.subtitleSize}px`,
                    color: text.subtitleColor,
                    fontFamily: text.fontFamily,
                    fontWeight: 500,
                    opacity: 0.94,
                    lineHeight: 1.35,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    textShadow: '0 4px 14px rgba(0,0,0,0.5)',
                    cursor: 'text',
                    borderRadius: '8px',
                    padding: '4px 6px',
                    display: 'inline-block',
                    maxWidth: '100%'
                  }}
                >
                  {text.subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Device Mockup */}
      <DeviceMockup
        deviceConfig={currentDeviceConfig}
        orientation={deviceState.orientation || 'portrait'}
        rotation={deviceState.rotation || 0}
        screenshot={deviceState.screenshot}
        fitMode={deviceState.fitMode || 'cover'}
        innerZoom={deviceState.innerZoom || 1}
        innerX={deviceState.innerX || 0}
        innerY={deviceState.innerY || 0}
        frameScale={deviceState.frameScale || currentDeviceConfig?.defaultScale || 1.8}
        frameX={deviceState.frameX || 0}
        frameY={deviceState.frameY !== undefined ? deviceState.frameY : (currentDeviceConfig?.defaultY || 300)}
        shadowIntensity={deviceState.shadowIntensity !== undefined ? deviceState.shadowIntensity : 0.5}
        frameFinishId={deviceState.frameFinishId || 'titanium-dark'}
        customFrameColor={deviceState.customFrameColor || '#2d2d32'}
        cameraStyleOverride={deviceState.cameraStyleOverride || null}
        showGlare={deviceState.showGlare || false}
        isDraggingOver={isDraggingOver}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
});

export default Canvas;
