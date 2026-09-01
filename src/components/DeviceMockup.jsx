import React, { useState } from 'react';
import { FRAME_FINISHES } from '../constants/storeConfigs';

/**
 * Universal Device Mockup supporting iPhone, iPad, Android Flagships, Tablets, & Foldables.
 */
export default function DeviceMockup({
  id,
  deviceName = 'Device',
  deviceConfig,
  orientation = 'portrait',
  rotation = 0,
  screenshot = null,
  fitMode = 'cover', // 'cover' or 'contain'
  innerZoom = 1,
  innerX = 0,
  innerY = 0,
  frameScale = 1,
  frameX = 0,
  frameY = 0,
  shadowIntensity = 0.5,
  frameFinishId = 'titanium-dark',
  customFrameColor = '#2d2d32',
  cameraStyleOverride = null,
  showGlare = false,
  isDraggingOver = false,
  isSelected = false,
  showDeviceBadge = false,
  zIndex = 10,
  onMouseDown,
  onSelect,
  onDropScreenshot
}) {
  const [isSelfDraggingOver, setIsSelfDraggingOver] = useState(false);

  const isLandscape = orientation === 'landscape';
  const type = deviceConfig?.type || 'iphone';
  const isIphone = type === 'iphone';
  const isIpad = type === 'ipad';
  const isAndroidPhone = type === 'android-phone' || type === 'feature-graphic';
  const isAndroidTablet = type === 'android-tablet';
  const isFoldable = type === 'android-foldable';

  // Determine base dimensions
  let baseWidth = deviceConfig?.baseWidth || 460;
  let baseHeight = deviceConfig?.baseHeight || 950;

  if (isLandscape && !isFoldable) {
    const temp = baseWidth;
    baseWidth = baseHeight;
    baseHeight = temp;
  }

  // Radiuses and padding
  const borderRadius = deviceConfig?.borderRadius || (isIphone ? '52px' : isAndroidPhone ? '46px' : '36px');
  const innerBorderRadius = deviceConfig?.innerBorderRadius || (isIphone ? '36px' : isAndroidPhone ? '32px' : '20px');
  const padding = deviceConfig?.padding || (isIphone ? '18px' : isAndroidPhone ? '16px' : '22px');

  // Frame finish styling
  const finish = FRAME_FINISHES.find(f => f.id === frameFinishId) || FRAME_FINISHES[0];
  const frameBackground = finish.id === 'custom'
    ? customFrameColor
    : finish.metallic || finish.color;
  const frameBorderColor = finish.id === 'custom'
    ? 'rgba(255, 255, 255, 0.2)'
    : finish.border;

  // Active camera style
  const activeCameraStyle = cameraStyleOverride || deviceConfig?.cameraStyle || (isAndroidPhone ? 'punch-hole-center' : 'dynamic-island');

  const activeDragHighlight = isSelfDraggingOver || isDraggingOver;

  // Targeted drag and drop handlers per mockup
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSelfDraggingOver) setIsSelfDraggingOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelfDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setIsSelfDraggingOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelfDraggingOver(false);

    if (e.dataTransfer?.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (onDropScreenshot) {
            onDropScreenshot(evt.target.result, id);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDeviceClick = (e) => {
    if (onSelect) onSelect(id);
    if (onMouseDown) onMouseDown(e, id);
  };

  return (
    <div
      onMouseDown={handleDeviceClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${baseWidth}px`,
        height: `${baseHeight}px`,
        transform: `translate(-50%, -50%) translate(${frameX}px, ${frameY}px) scale(${frameScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: 'grab',
        userSelect: 'none',
        zIndex: zIndex || 10,
        filter: `drop-shadow(0 35px 70px rgba(0, 0, 0, ${shadowIntensity}))`,
        transition: 'transform 0.05s ease-out'
      }}
    >
      {/* Optional Selected Device Floating Badge */}
      {showDeviceBadge && (
        <div
          style={{
            position: 'absolute',
            top: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.95)' : 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            border: isSelected ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>📱</span>
          <span>{deviceName}</span>
          {isSelected && <span style={{ opacity: 0.8, fontSize: '9px' }}>● Active</span>}
        </div>
      )}

      {/* Outer Device Chassis Frame */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: borderRadius,
          background: frameBackground,
          padding: padding,
          boxSizing: 'border-box',
          position: 'relative',
          border: activeDragHighlight
            ? '2.5px solid #38bdf8'
            : isSelected && showDeviceBadge
            ? '2px solid rgba(59, 130, 246, 0.8)'
            : `2px solid ${frameBorderColor}`,
          boxShadow: activeDragHighlight
            ? '0 0 0 4px rgba(56, 189, 248, 0.5), 0 0 35px rgba(56, 189, 248, 0.7), inset 0 0 16px rgba(56, 189, 248, 0.4)'
            : isSelected && showDeviceBadge
            ? '0 0 0 3px rgba(59, 130, 246, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.25), inset 0 0 16px rgba(0, 0, 0, 0.8)'
            : 'inset 0 0 8px rgba(255, 255, 255, 0.25), inset 0 0 16px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0,0,0,0.6)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        {/* Android Ear Speaker Slit (Top Bezel) */}
        {isAndroidPhone && !isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '64px',
              height: '3px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '2px',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              zIndex: 35
            }}
          />
        )}

        {/* Dynamic Island (iPhone 14/15/16 Pro) */}
        {isIphone && activeCameraStyle === 'dynamic-island' && !isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '32px',
              backgroundColor: '#000000',
              borderRadius: '20px',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#1c1c2e', border: '1.5px solid #0d0d18' }} />
          </div>
        )}

        {/* iPhone Classic Notch */}
        {isIphone && activeCameraStyle === 'notch' && !isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '28px',
              backgroundColor: '#000000',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#222' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1a1a2e' }} />
          </div>
        )}

        {/* iPhone Landscape Island */}
        {isIphone && isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '26px',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '120px',
              backgroundColor: '#000000',
              borderRadius: '20px',
              zIndex: 30
            }}
          />
        )}

        {/* Android Punch Hole - Center */}
        {isAndroidPhone && activeCameraStyle === 'punch-hole-center' && (
          <div
            style={{
              position: 'absolute',
              top: isLandscape ? '50%' : '26px',
              left: isLandscape ? '26px' : '50%',
              transform: isLandscape ? 'translateY(-50%)' : 'translateX(-50%)',
              width: '14px',
              height: '14px',
              backgroundColor: '#000000',
              borderRadius: '50%',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 3px rgba(0, 0, 0, 0.9)'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2230', border: '0.5px solid #0f131a' }} />
          </div>
        )}

        {/* Android Punch Hole - Left */}
        {isAndroidPhone && activeCameraStyle === 'punch-hole-left' && (
          <div
            style={{
              position: 'absolute',
              top: '26px',
              left: '32px',
              width: '14px',
              height: '14px',
              backgroundColor: '#000000',
              borderRadius: '50%',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2230' }} />
          </div>
        )}

        {/* Android Punch Hole - Right */}
        {isAndroidPhone && activeCameraStyle === 'punch-hole-right' && (
          <div
            style={{
              position: 'absolute',
              top: '26px',
              right: '32px',
              width: '14px',
              height: '14px',
              backgroundColor: '#000000',
              borderRadius: '50%',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2230' }} />
          </div>
        )}

        {/* Pill Camera Style (Dual punch hole) */}
        {isAndroidPhone && activeCameraStyle === 'pill-camera' && (
          <div
            style={{
              position: 'absolute',
              top: '26px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '32px',
              height: '14px',
              backgroundColor: '#000000',
              borderRadius: '10px',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1c2230' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1c2230' }} />
          </div>
        )}

        {/* Tablet Front Camera Sensor */}
        {(isIpad || isAndroidTablet) && (
          <div
            style={{
              position: 'absolute',
              top: isLandscape ? '50%' : '12px',
              left: isLandscape ? '12px' : '50%',
              transform: isLandscape ? 'translateY(-50%)' : 'translateX(-50%)',
              width: '10px',
              height: '10px',
              backgroundColor: '#151518',
              borderRadius: '50%',
              zIndex: 30,
              border: '1px solid #333'
            }}
          />
        )}

        {/* Foldable Device Center Hinge Crease Effect */}
        {isFoldable && (
          <div
            style={{
              position: 'absolute',
              top: padding,
              bottom: padding,
              left: '50%',
              width: '2px',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(255,255,255,0.08), rgba(0,0,0,0.4))',
              zIndex: 25,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Inner Screen Mask Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: innerBorderRadius,
            backgroundColor: '#000000',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {screenshot ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img
                src={screenshot}
                alt="App Screenshot"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  minWidth: '100%',
                  minHeight: '100%',
                  width: '100%',
                  height: '100%',
                  objectFit: fitMode === 'cover' ? 'cover' : 'contain',
                  transform: `translate(-50%, -50%) translate(${innerX}px, ${innerY}px) scale(${innerZoom})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none'
                }}
              />

              {/* Optional Specular Glass Glare Reflection */}
              {showGlare && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-30%',
                    width: '160%',
                    height: '200%',
                    background: 'linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)',
                    pointerEvents: 'none',
                    transform: 'rotate(-20deg)'
                  }}
                />
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center',
                padding: '24px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {isIphone ? '🍏' : isIpad ? '💻' : isFoldable ? '📖' : '🤖'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '6px' }}>
                Upload Screenshot
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, maxWidth: '250px' }}>
                {deviceConfig?.name || 'Device'}
                <br />
                <span style={{ fontSize: '11px', color: '#38bdf8' }}>{deviceConfig?.badge}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
