import React from 'react';
import { 
  Star, Share2, Shield, Award, Sparkles, 
  ArrowLeft, ArrowRight, Download, MoreVertical, Search
} from 'lucide-react';
import { STORES } from '../constants/storeConfigs';
import SlideThumbnail from './SlideThumbnail';

export default function StoreMockup({
  store = STORES.APP_STORE,
  storeMetadata = {},
  scenes = [],
  activeLocale = 'en-US',
  renderedPreviews = {},
  onSelectScene,
  onSwitchToEditor,
  currentDeviceConfig,
  canvasWidth = 1290,
  canvasHeight = 2796
}) {
  const isAppStore = store === STORES.APP_STORE;
  const isRtl = activeLocale.startsWith('ar') || activeLocale.startsWith('he');

  const {
    appName = 'AppName Pro',
    subtitle = { 'en-US': 'Ultimate Productivity & Habits', 'ar-SA': 'أفضل تطبيق للإنتاجية والمهام' },
    developer = 'Studio Labs Inc.',
    category = 'Productivity',
    rating = 4.9,
    ratingCount = '18.4K Ratings',
    ageRating = '4+',
    description = {
      'en-US': 'Experience next-generation productivity with AppName Pro. Designed with precision, seamless gesture navigation, and robust security.',
      'ar-SA': 'ارتقِ بإنتاجيتك اليومية مع AppName Pro. مصمم بأعلى معايير الدقة والسرعة ليمنحك تجربة استخدام فائقة السلاسة.'
    },
    iconUrl = null
  } = storeMetadata;

  const currentSubtitle = typeof subtitle === 'object' ? (subtitle[activeLocale] || subtitle['en-US'] || '') : subtitle;
  const currentDescription = typeof description === 'object' ? (description[activeLocale] || description['en-US'] || '') : description;

  return (
    <div className={`store-simulator-root ${isAppStore ? 'apple-store-mode' : 'google-play-mode'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="store-device-bezel">
        {/* ========================================================================= */}
        {/* 1. APPLE APP STORE INTERFACE */}
        {/* ========================================================================= */}
        {isAppStore && (
          <div className="ios-store-container">
            {/* iOS Top Bar */}
            <div className="ios-top-nav">
              <button className="ios-nav-back" onClick={onSwitchToEditor}>
                {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                <span>Studio</span>
              </button>
              <span className="ios-nav-title">{appName}</span>
              <button className="ios-nav-action">
                <Share2 size={16} />
              </button>
            </div>

            {/* iOS Scroll Body */}
            <div className="ios-store-scroll">
              {/* Header Hero */}
              <div className="ios-app-header">
                <div className="ios-app-icon">
                  {iconUrl ? (
                    <img src={iconUrl} alt="App Icon" />
                  ) : (
                    <div className="ios-icon-fallback">
                      <Sparkles size={36} color="#ffffff" />
                    </div>
                  )}
                </div>

                <div className="ios-app-info">
                  <h1 className="ios-title">{appName}</h1>
                  <p className="ios-subtitle">{currentSubtitle}</p>
                  <p className="ios-developer">{developer}</p>
                  <div className="ios-get-row">
                    <button className="ios-get-btn">GET</button>
                    <span className="ios-inapp">In-App Purchases</span>
                  </div>
                </div>
              </div>

              {/* iOS Metrics Strip */}
              <div className="ios-metrics-strip">
                <div className="ios-metric-col">
                  <div className="ios-metric-val">
                    <span>{rating}</span>
                    <div className="ios-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <span className="ios-metric-sub">{ratingCount}</span>
                </div>

                <div className="ios-metric-div" />

                <div className="ios-metric-col">
                  <div className="ios-metric-val">
                    <Award size={16} className="text-blue-400" />
                  </div>
                  <span className="ios-metric-sub">#1 in {category}</span>
                </div>

                <div className="ios-metric-div" />

                <div className="ios-metric-col">
                  <div className="ios-metric-val">
                    <span className="age-badge">{ageRating}</span>
                  </div>
                  <span className="ios-metric-sub">Years Old</span>
                </div>

                <div className="ios-metric-div" />

                <div className="ios-metric-col">
                  <div className="ios-metric-val">
                    <Shield size={16} className="text-emerald-400" />
                  </div>
                  <span className="ios-metric-sub">Safe & Secure</span>
                </div>
              </div>

              {/* iOS Screenshots Carousel */}
              <div className="ios-gallery-section">
                <div className="ios-section-head">
                  <h3>Screenshots</h3>
                  <span>iPhone & iPad</span>
                </div>

                <div className="ios-gallery-track">
                  {scenes.map((scene, idx) => {
                    const preview = renderedPreviews[scene.id];
                    return (
                      <div
                        key={scene.id}
                        className="ios-slide-card"
                        onClick={() => {
                          onSelectScene(scene.id);
                          onSwitchToEditor();
                        }}
                        title="Click to edit this screenshot in Studio"
                      >
                        <div className="ios-slide-card-inner">
                          {preview ? (
                            <img src={preview} alt={`Slide ${idx + 1}`} className="ios-slide-img" />
                          ) : (
                            <SlideThumbnail
                              scene={scene}
                              currentDeviceConfig={currentDeviceConfig}
                              canvasWidth={canvasWidth}
                              canvasHeight={canvasHeight}
                              activeLocale={activeLocale}
                              targetWidth={180}
                              targetHeight={390}
                            />
                          )}
                        </div>
                        <span className="ios-slide-badge">Slide #{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* iOS Description */}
              <div className="ios-desc-section">
                <h3>Description</h3>
                <p>{currentDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. GOOGLE PLAY STORE INTERFACE */}
        {/* ========================================================================= */}
        {!isAppStore && (
          <div className="play-store-container">
            {/* Play Top Bar */}
            <div className="play-top-nav">
              <button className="play-nav-back" onClick={onSwitchToEditor}>
                {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div className="play-nav-actions">
                <Search size={18} />
                <MoreVertical size={18} />
              </div>
            </div>

            {/* Play Scroll Body */}
            <div className="play-store-scroll">
              {/* Play Hero Header */}
              <div className="play-app-header">
                <div className="play-app-icon">
                  {iconUrl ? (
                    <img src={iconUrl} alt="App Icon" />
                  ) : (
                    <div className="play-icon-fallback">
                      <Sparkles size={36} color="#ffffff" />
                    </div>
                  )}
                </div>

                <div className="play-app-info">
                  <h1 className="play-title">{appName}</h1>
                  <p className="play-developer">{developer}</p>
                  <span className="play-inapp-tag">Contains ads · In-app purchases</span>
                </div>
              </div>

              {/* Play Quick Stats Strip */}
              <div className="play-stats-strip">
                <div className="play-stat-item">
                  <div className="play-stat-top">
                    <span className="play-rating-num">{rating}</span>
                    <Star size={11} fill="#10b981" color="#10b981" />
                  </div>
                  <span className="play-stat-sub">{ratingCount}</span>
                </div>

                <div className="play-stat-divider" />

                <div className="play-stat-item">
                  <div className="play-stat-top">
                    <Download size={14} className="text-emerald-400" />
                    <span className="play-down-num">1M+</span>
                  </div>
                  <span className="play-stat-sub">Downloads</span>
                </div>

                <div className="play-stat-divider" />

                <div className="play-stat-item">
                  <div className="play-stat-top">
                    <span className="play-rating-badge">{ageRating}</span>
                  </div>
                  <span className="play-stat-sub">Rated for 3+</span>
                </div>
              </div>

              {/* Play Big Install Button */}
              <button className="play-install-btn">
                Install
              </button>

              {/* Play Screenshots Carousel */}
              <div className="play-gallery-section">
                <div className="play-section-head">
                  <h3>App support</h3>
                  <span>Phone & Tablet</span>
                </div>

                <div className="play-gallery-track">
                  {scenes.map((scene, idx) => {
                    const preview = renderedPreviews[scene.id];
                    return (
                      <div
                        key={scene.id}
                        className="play-slide-card"
                        onClick={() => {
                          onSelectScene(scene.id);
                          onSwitchToEditor();
                        }}
                        title="Click to edit this screenshot in Studio"
                      >
                        <div className="play-slide-card-inner">
                          {preview ? (
                            <img src={preview} alt={`Slide ${idx + 1}`} className="play-slide-img" />
                          ) : (
                            <SlideThumbnail
                              scene={scene}
                              currentDeviceConfig={currentDeviceConfig}
                              canvasWidth={canvasWidth}
                              canvasHeight={canvasHeight}
                              activeLocale={activeLocale}
                              targetWidth={180}
                              targetHeight={390}
                            />
                          )}
                        </div>
                        <span className="play-slide-label">Screen #{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Play About This App */}
              <div className="play-about-section">
                <h3>About this app</h3>
                <p>{currentDescription}</p>
                <div className="play-tags-row">
                  <span className="play-tag-pill">#{category}</span>
                  <span className="play-tag-pill">#Tools</span>
                  <span className="play-tag-pill">#Productivity</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
