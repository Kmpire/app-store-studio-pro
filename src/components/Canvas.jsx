import React, { forwardRef, useState } from 'react';
import DeviceMockup from './DeviceMockup';

const Canvas = forwardRef(({ state }, ref) => {
  const { device, canvasWidth, canvasHeight, bgState, text, deviceState } = state;
  const [isDraggingDevice, setIsDraggingDevice] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Background styling
  const renderBackgroundLayer = () => {
    if (bgState.type === 'color') {
      return (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: bgState.color }} />
      );
    }
    if (bgState.type === 'gradient') {
      const gradCss = bgState.gradientType === 'radial'
        ? `radial-gradient(circle, ${bgState.color1} 0%, ${bgState.color2} 100%)`
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
              opacity: bgState.overlayOpacity / 100
            }}
          />
        </div>
      );
    }
    return <div style={{ position: 'absolute', inset: 0, backgroundColor: '#0f172a' }} />;
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingDevice(true);
    setDragStart({
      x: e.clientX - deviceState.frameX,
      y: e.clientY - deviceState.frameY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDraggingDevice) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    state.setDeviceState(prev => ({ ...prev, frameX: newX, frameY: newY }));
  };

  const handleMouseUp = () => {
    setIsDraggingDevice(false);
  };

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
        borderRadius: '16px'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Layer */}
      {renderBackgroundLayer()}

      {/* Decorative Light Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: '70%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          borderRadius: '50%'
        }} 
      />

      {/* Text Section */}
      {(text.title || text.subtitle) && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${text.offsetY}%`,
            transform: 'translateY(-50%)',
            padding: '0 8%',
            textAlign: text.align,
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          {text.title && (
            <h1
              style={{
                fontSize: `${text.titleSize}px`,
                color: text.titleColor,
                fontFamily: text.fontFamily,
                fontWeight: text.fontWeight || 800,
                lineHeight: 1.15,
                marginBottom: '20px',
                whiteSpace: 'pre-wrap',
                textShadow: '0 6px 16px rgba(0,0,0,0.4)'
              }}
            >
              {text.title}
            </h1>
          )}
          {text.subtitle && (
            <p
              style={{
                fontSize: `${text.subtitleSize}px`,
                color: text.subtitleColor,
                fontFamily: text.fontFamily,
                fontWeight: 500,
                opacity: 0.92,
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                textShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              {text.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Device Mockup */}
      <DeviceMockup
        device={device}
        orientation={deviceState.orientation || 'portrait'}
        rotation={deviceState.rotation || 0}
        screenshot={deviceState.screenshot}
        fitMode={deviceState.fitMode || 'cover'}
        innerZoom={deviceState.innerZoom}
        innerX={deviceState.innerX}
        innerY={deviceState.innerY}
        frameScale={deviceState.frameScale}
        frameX={deviceState.frameX}
        frameY={deviceState.frameY}
        shadowIntensity={deviceState.shadowIntensity || 0.5}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
});

export default Canvas;
