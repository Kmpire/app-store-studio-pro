import React from 'react';

/**
 * iPhone & iPad Mockup with edge-to-edge screenshot masking and seamless crop.
 */
export default function DeviceMockup({ 
  device = 'iphone',
  orientation = 'portrait',
  rotation = 0,
  screenshot = null,
  fitMode = 'cover', // 'cover' or 'custom'
  innerZoom = 1,
  innerX = 0,
  innerY = 0,
  frameScale = 1,
  frameX = 0,
  frameY = 0,
  shadowIntensity = 0.5,
  onMouseDown
}) {
  const isIphone = device === 'iphone';
  const isLandscape = orientation === 'landscape';

  // Base dimensions
  let baseWidth = isIphone ? 460 : 680;
  let baseHeight = isIphone ? 950 : 920;

  if (isLandscape) {
    const temp = baseWidth;
    baseWidth = baseHeight;
    baseHeight = temp;
  }

  const borderRadius = isIphone ? '52px' : '36px';
  const innerBorderRadius = isIphone ? '36px' : '20px';
  const padding = isIphone ? '18px' : '22px';

  return (
    <div
      onMouseDown={onMouseDown}
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
        zIndex: 10,
        filter: `drop-shadow(0 35px 70px rgba(0, 0, 0, ${shadowIntensity}))`,
        transition: 'transform 0.05s ease-out'
      }}
    >
      {/* Outer Device Frame */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: borderRadius,
          background: 'linear-gradient(145deg, #2d2d32, #111115)',
          padding: padding,
          boxSizing: 'border-box',
          position: 'relative',
          border: '2px solid rgba(255, 255, 255, 0.18)',
          boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.25), inset 0 0 15px rgba(0,0,0,0.8)'
        }}
      >
        {/* Dynamic Island / Notch */}
        {isIphone && !isLandscape && (
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
              paddingRight: '12px'
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1c1c2e', border: '1px solid #0d0d18' }} />
          </div>
        )}

        {isIphone && isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '28px',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '120px',
              backgroundColor: '#000000',
              borderRadius: '20px',
              zIndex: 30
            }}
          />
        )}

        {!isIphone && (
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

        {/* Screen Mask Container */}
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
                {isIphone ? '📱' : '💻'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '6px' }}>
                Upload Screenshot
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, maxWidth: '240px' }}>
                Choose your {isIphone ? 'iPhone' : 'iPad'} screenshot to fit edge-to-edge inside mask
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
