import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  FileImage, 
  FolderArchive, 
  Loader2
} from 'lucide-react';

export default function ExportDropdown({
  onExportSingle,
  onExportZip,
  onDownloadAll,
  isExporting = false,
  isExportingZip = false,
  exportStatusText = '',
  activeSlideIndex = 0,
  totalSlidesCount = 1,
  align = 'right',
  btnClassName = 'export-btn'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const busy = isExporting || isExportingZip;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <div className="header-dropdown-container export-dropdown-container" ref={dropdownRef}>
      <button 
        className={`${btnClassName} ${busy ? 'exporting' : ''} ${isOpen ? 'active' : ''}`}
        onClick={() => !busy && setIsOpen(prev => !prev)}
        disabled={busy}
        title="Export options (PNG, JPG, ZIP)"
      >
        {busy ? (
          <Loader2 size={16} className="export-spin-icon" />
        ) : (
          <Download size={15} />
        )}
        <span>{exportStatusText || 'Export'}</span>
        <ChevronDown size={13} className={`dropdown-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`header-dropdown-menu export-dropdown-menu align-${align}`}
          style={{ [align]: 0 }}
        >
          {/* SECTION 1: Current Slide */}
          <div className="dropdown-menu-header export-menu-section-header">
            <span>Current Slide (Slide {activeSlideIndex + 1})</span>
          </div>

          <button 
            className="dropdown-menu-item export-item"
            onClick={() => handleAction(() => onExportSingle('png'))}
          >
            <div className="item-icon-circle export-icon-png">
              <FileImage size={15} />
            </div>
            <div className="item-text-group">
              <div className="item-title-row">
                <span className="item-title">Export as PNG</span>
                <span className="export-format-badge badge-png">PNG</span>
              </div>
              <span className="item-subtitle">High resolution lossless image (.png)</span>
            </div>
          </button>

          <button 
            className="dropdown-menu-item export-item"
            onClick={() => handleAction(() => onExportSingle('jpg'))}
          >
            <div className="item-icon-circle export-icon-jpg">
              <FileImage size={15} />
            </div>
            <div className="item-text-group">
              <div className="item-title-row">
                <span className="item-title">Export as JPG</span>
                <span className="export-format-badge badge-jpg">JPG</span>
              </div>
              <span className="item-subtitle">Optimized 95% quality, smaller size (.jpg)</span>
            </div>
          </button>

          <div className="dropdown-menu-divider" />

          {/* SECTION 2: All Slides */}
          <div className="dropdown-menu-header export-menu-section-header">
            <span>All Slides ({totalSlidesCount} {totalSlidesCount === 1 ? 'Slide' : 'Slides'})</span>
          </div>

          <button 
            className="dropdown-menu-item export-item"
            onClick={() => handleAction(() => onExportZip('png'))}
          >
            <div className="item-icon-circle export-icon-zip-png">
              <FolderArchive size={15} />
            </div>
            <div className="item-text-group">
              <div className="item-title-row">
                <span className="item-title">Export All as ZIP (PNG)</span>
                <span className="export-format-badge badge-zip">ZIP</span>
              </div>
              <span className="item-subtitle">All slides bundled in a .zip archive (PNG)</span>
            </div>
          </button>

          <button 
            className="dropdown-menu-item export-item"
            onClick={() => handleAction(() => onExportZip('jpg'))}
          >
            <div className="item-icon-circle export-icon-zip-jpg">
              <FolderArchive size={15} />
            </div>
            <div className="item-text-group">
              <div className="item-title-row">
                <span className="item-title">Export All as ZIP (JPG)</span>
                <span className="export-format-badge badge-zip">ZIP</span>
              </div>
              <span className="item-subtitle">All slides bundled in a .zip archive (JPG)</span>
            </div>
          </button>

          <button 
            className="dropdown-menu-item export-item"
            onClick={() => handleAction(() => onDownloadAll('png'))}
          >
            <div className="item-icon-circle export-icon-download">
              <Download size={15} />
            </div>
            <div className="item-text-group">
              <div className="item-title-row">
                <span className="item-title">Download All PNGs</span>
                <span className="export-format-badge badge-subtle">PNGs</span>
              </div>
              <span className="item-subtitle">Download each slide separately (.png)</span>
            </div>
          </button>

          <button 
            className="dropdown-menu-item export-item"
            onClick={() => handleAction(() => onDownloadAll('jpg'))}
          >
            <div className="item-icon-circle export-icon-download">
              <Download size={15} />
            </div>
            <div className="item-text-group">
              <div className="item-title-row">
                <span className="item-title">Download All JPGs</span>
                <span className="export-format-badge badge-subtle">JPGs</span>
              </div>
              <span className="item-subtitle">Download each slide separately (.jpg)</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
