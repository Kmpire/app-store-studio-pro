import React from 'react';
import { 
  Plus, Copy, Trash2, ChevronLeft, ChevronRight, 
  Layers 
} from 'lucide-react';
import SlideThumbnail from './SlideThumbnail';
import ExportDropdown from './ExportDropdown';

export default function StripManager({
  scenes = [],
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
  activeLocale = 'en-US',
  onExportSingle,
  onExportAllZip,
  onDownloadAll,
  isExporting = false,
  isExportingZip = false,
  exportStatusText = '',
  currentDeviceConfig,
  canvasWidth = 1290,
  canvasHeight = 2796
}) {
  const isRtl = activeLocale.startsWith('ar') || activeLocale.startsWith('he');
  const activeIndex = scenes.findIndex(s => s.id === activeSceneId);

  return (
    <div className="strip-manager-container" >
      {/* Top Bar with Batch Export Actions */}
      <div className="strip-top-bar">
        <div className="strip-title-badge">
          <Layers size={18} className="text-indigo-400" />
          <span>Screenshots Sequence ({scenes.length} {scenes.length === 1 ? 'Slide' : 'Slides'})</span>
        </div>

        <div className="strip-top-actions">
          <ExportDropdown
            onExportSingle={onExportSingle}
            onExportZip={onExportAllZip}
            onDownloadAll={onDownloadAll}
            isExporting={isExporting}
            isExportingZip={isExportingZip}
            exportStatusText={exportStatusText}
            activeSlideIndex={activeIndex >= 0 ? activeIndex : 0}
            totalSlidesCount={scenes.length}
            align="right"
            btnClassName="btn btn-primary btn-sm"
          />
          <button className="btn btn-accent btn-sm" onClick={onAddScene}>
            <Plus size={15} /> Add Slide
          </button>
        </div>
      </div>

      {/* Horizontal Cards Grid / Strip */}
      <div className="strip-cards-track" dir={isRtl ? 'rtl' : 'ltr'}>
        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;

          return (
            <div
              key={scene.id}
              className={`strip-slide-card ${isActive ? 'active-slide' : ''}`}
              onClick={() => onSelectScene(scene.id)}
            >
              {/* Header */}
              <div className="slide-card-header">
                <span className="slide-index-pill">Slide #{index + 1}</span>
                <div className="slide-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="card-action-btn"
                    disabled={index === 0}
                    title="Move Left"
                    onClick={() => onMoveScene(index, index - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    className="card-action-btn"
                    disabled={index === scenes.length - 1}
                    title="Move Right"
                    onClick={() => onMoveScene(index, index + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className="card-action-btn"
                    title="Duplicate Slide"
                    onClick={() => onDuplicateScene(scene.id)}
                  >
                    <Copy size={13} />
                  </button>
                  {scenes.length > 1 && (
                    <button
                      className="card-action-btn delete-btn"
                      title="Delete Slide"
                      onClick={() => onDeleteScene(scene.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail Viewport */}
              <div className="slide-preview-viewport">
                <SlideThumbnail
                  scene={scene}
                  currentDeviceConfig={currentDeviceConfig}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  activeLocale={activeLocale}
                  targetWidth={230}
                  targetHeight={420}
                />
              </div>

              {/* Click to Edit Banner */}
              <div className="slide-card-footer">
                <span className="edit-hint-label">✎ Click to edit in Studio</span>
              </div>
            </div>
          );
        })}

        {/* Add Slide Card */}
        <div className="strip-add-card" onClick={onAddScene}>
          <div className="add-card-inner">
            <Plus size={28} className="text-indigo-400" />
            <span>Add Screenshot</span>
            <small>Slide #{scenes.length + 1}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
