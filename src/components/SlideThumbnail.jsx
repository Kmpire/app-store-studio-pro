import React from 'react';
import Canvas from './Canvas';
import { DEVICE_CONFIGS } from '../constants/storeConfigs';

export default function SlideThumbnail({
  scene,
  currentDeviceConfig,
  canvasWidth = 1290,
  canvasHeight = 2796,
  activeLocale = 'en-US',
  targetWidth = 230,
  targetHeight = 420
}) {
  if (!scene) return null;

  const sceneConfig = (scene.deviceId && DEVICE_CONFIGS[scene.deviceId])
    ? DEVICE_CONFIGS[scene.deviceId]
    : (currentDeviceConfig || DEVICE_CONFIGS['iphone-6-7']);
  const effectiveW = sceneConfig.width || canvasWidth;
  const effectiveH = sceneConfig.height || canvasHeight;

  const scale = Math.min(targetWidth / effectiveW, targetHeight / effectiveH);
  const scaledWidth = effectiveW * scale;
  const scaledHeight = effectiveH * scale;

  const thumbnailState = {
    currentDeviceConfig: sceneConfig,
    canvasWidth: effectiveW,
    canvasHeight: effectiveH,
    bgState: scene.bgState || {
      type: 'gradient',
      color: '#0f172a',
      color1: '#0f172a',
      color2: '#0284c7',
      gradientType: 'linear',
      gradientAngle: 135,
      scale: 1,
      posX: 0,
      posY: 0,
      blur: 0
    },
    text: {
      badgeText: scene.badgeText || '',
      title: typeof scene.headlines === 'object'
        ? (scene.headlines[activeLocale] || scene.headlines['en-US'] || '')
        : (scene.headlines || ''),
      subtitle: typeof scene.subheads === 'object'
        ? (scene.subheads[activeLocale] || scene.subheads['en-US'] || '')
        : (scene.subheads || ''),
      titleSize: scene.textStyle?.titleSize ?? 110,
      titleColor: scene.textStyle?.titleColor ?? '#ffffff',
      subtitleSize: scene.textStyle?.subtitleSize ?? 52,
      subtitleColor: scene.textStyle?.subtitleColor ?? '#cbd5e1',
      fontFamily: scene.textStyle?.fontFamily ?? 'Cairo',
      offsetY: scene.textStyle?.offsetY ?? 12,
      align: scene.textStyle?.align ?? 'center'
    },
    setText: () => {},
    devicesList: scene.devicesList || [],
    activeDeviceId: null, // Guarantees zero focus outline, badge, or selection styling
    setActiveDeviceId: () => {},
    updateDevice: () => {},
    deviceState: null,
    activeLocale
  };

  return (
    <div
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
        pointerEvents: 'none',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: `${effectiveW}px`,
          height: `${effectiveH}px`,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      >
        <Canvas state={thumbnailState} />
      </div>
    </div>
  );
}
