import React, { useState, useRef, useEffect } from 'react';
import { 
  Languages, 
  Plus, 
  Trash2, 
  Globe, 
  X, 
  Search, 
  Copy, 
  Check, 
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LOCALES } from '../constants/goldieLayouts';

export default function LocaleManagerModal({
  isOpen,
  onClose,
  locales,
  activeLocale,
  onSetActiveLocale,
  onAddLocale,
  onRemoveLocale,
  scenes,
  onUpdateSceneText
}) {
  const [selectedEditingLocale, setSelectedEditingLocale] = useState(activeLocale || 'en-US');
  const [referenceLocale, setReferenceLocale] = useState(
    locales.includes('en-US') ? 'en-US' : (locales[0] || 'en-US')
  );
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlideId, setCopiedSlideId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const addPopoverRef = useRef(null);

  // Sync selectedEditingLocale when activeLocale changes or modal opens
  useEffect(() => {
    if (activeLocale && locales.includes(activeLocale)) {
      setSelectedEditingLocale(activeLocale);
    } else if (locales.length > 0 && !locales.includes(selectedEditingLocale)) {
      setSelectedEditingLocale(locales[0]);
    }
  }, [activeLocale, locales, selectedEditingLocale]);

  // Click outside to close Add Language Popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addPopoverRef.current && !addPopoverRef.current.contains(e.target)) {
        setIsAddPopoverOpen(false);
      }
    };
    if (isAddPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddPopoverOpen]);

  if (!isOpen) return null;

  const currentLocaleInfo = SUPPORTED_LOCALES.find(l => l.code === selectedEditingLocale) || {
    code: selectedEditingLocale,
    name: selectedEditingLocale,
    flag: '🌐'
  };

  const refLocaleInfo = SUPPORTED_LOCALES.find(l => l.code === referenceLocale) || {
    code: referenceLocale,
    name: referenceLocale,
    flag: '🌐'
  };

  const isRtl = selectedEditingLocale.startsWith('ar') || selectedEditingLocale.startsWith('he');
  const isRefRtl = referenceLocale.startsWith('ar') || referenceLocale.startsWith('he');

  // Filter available languages to add
  const availableToAdd = SUPPORTED_LOCALES
    .filter(l => !locales.includes(l.code))
    .filter(l => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q);
    });

  const handleSelectAddLocale = (code) => {
    onAddLocale(code);
    setSelectedEditingLocale(code);
    setIsAddPopoverOpen(false);
    setSearchQuery('');
  };

  const getLocaleProgress = (code) => {
    if (!scenes || scenes.length === 0) return { completed: 0, total: 0, percent: 100 };
    let completed = 0;
    scenes.forEach(sc => {
      const h = sc.headlines?.[code]?.trim();
      if (h) completed++;
    });
    return {
      completed,
      total: scenes.length,
      percent: Math.round((completed / scenes.length) * 100)
    };
  };

  const handleCopyFromReference = (sceneId) => {
    const sc = scenes.find(s => s.id === sceneId);
    if (!sc) return;
    const refH = sc.headlines?.[referenceLocale] || sc.headlines?.['en-US'] || '';
    const refS = sc.subheads?.[referenceLocale] || sc.subheads?.['en-US'] || '';
    onUpdateSceneText(sceneId, selectedEditingLocale, 'headline', refH);
    onUpdateSceneText(sceneId, selectedEditingLocale, 'subhead', refS);
    setCopiedSlideId(sceneId);
    setTimeout(() => setCopiedSlideId(null), 1500);
  };

  const handleCopyAllFromReference = () => {
    scenes.forEach(sc => {
      const refH = sc.headlines?.[referenceLocale] || sc.headlines?.['en-US'] || '';
      const refS = sc.subheads?.[referenceLocale] || sc.subheads?.['en-US'] || '';
      onUpdateSceneText(sc.id, selectedEditingLocale, 'headline', refH);
      onUpdateSceneText(sc.id, selectedEditingLocale, 'subhead', refS);
    });
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card locale-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Languages size={22} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="modal-title">Multi-Locale Manager</h3>
              <p className="modal-subtitle">
                Manage App Store languages, translate headlines, and localize your screenshot set
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Master-Detail Body */}
        <div className="locale-master-detail">
          {/* Left Sidebar: Languages List */}
          <div className="locale-sidebar">
            <div className="locale-sidebar-header">
              <div className="sidebar-header-title">
                <span>Languages ({locales.length})</span>
              </div>

              {/* Add Language Button & Popover */}
              <div className="add-lang-popover-anchor" ref={addPopoverRef}>
                <button 
                  className={`btn-add-language-trigger ${isAddPopoverOpen ? 'active' : ''}`}
                  onClick={() => setIsAddPopoverOpen(p => !p)}
                  title="Add new language"
                >
                  <Plus size={14} />
                  <span>Add Language</span>
                </button>

                {isAddPopoverOpen && (
                  <div className="add-lang-popover-card">
                    <div className="popover-search-wrap">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search language or code..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                        className="popover-search-input"
                      />
                    </div>
                    <div className="popover-languages-list">
                      {availableToAdd.length === 0 ? (
                        <div className="popover-empty">No languages found</div>
                      ) : (
                        availableToAdd.map(l => (
                          <button
                            key={l.code}
                            className="popover-lang-item"
                            onClick={() => handleSelectAddLocale(l.code)}
                          >
                            <span className="lang-item-flag">{l.flag}</span>
                            <span className="lang-item-name">{l.name}</span>
                            <span className="lang-item-code">{l.code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Languages List */}
            <div className="locale-sidebar-list">
              {locales.map(code => {
                const lInfo = SUPPORTED_LOCALES.find(l => l.code === code) || { code, name: code, flag: '🌐' };
                const isSelected = selectedEditingLocale === code;
                const isCurrentlyActiveInEditor = activeLocale === code;
                const progress = getLocaleProgress(code);
                const isComplete = progress.completed === progress.total && progress.total > 0;

                return (
                  <div
                    key={code}
                    className={`locale-sidebar-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedEditingLocale(code);
                      onSetActiveLocale(code);
                    }}
                  >
                    <div className="card-top-row">
                      <div className="card-flag-name">
                        <span className="card-flag">{lInfo.flag}</span>
                        <div className="card-name-group">
                          <span className="card-name">{lInfo.name}</span>
                          <span className="card-code">{code}</span>
                        </div>
                      </div>

                      {locales.length > 1 && (
                        <button
                          className="card-delete-btn"
                          title={`Remove ${lInfo.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLocale(code);
                            if (selectedEditingLocale === code) {
                              const remaining = locales.filter(c => c !== code);
                              setSelectedEditingLocale(remaining[0] || 'en-US');
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="card-bottom-row">
                      <div className={`progress-badge ${isComplete ? 'complete' : ''}`}>
                        <span className="progress-dot" />
                        <span>{progress.completed}/{progress.total} Slides</span>
                      </div>
                      {isCurrentlyActiveInEditor && (
                        <span className="active-canvas-tag">Active in Editor</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Workspace: Translation Details for Selected Language */}
          <div className="locale-workspace">
            {/* Workspace Top Toolbar */}
            <div className="workspace-toolbar">
              <div className="workspace-target-banner">
                <span className="target-flag">{currentLocaleInfo.flag}</span>
                <div>
                  <h4 className="target-title">Editing {currentLocaleInfo.name}</h4>
                  <span className="target-subtitle">
                    {scenes.length} slide{scenes.length > 1 ? 's' : ''} in project • {isRtl ? 'RTL Text' : 'LTR Text'}
                  </span>
                </div>
              </div>

              {/* Reference Language Selector & Copy All */}
              <div className="workspace-toolbar-actions">
                <div className="reference-selector-group">
                  <span className="ref-label">Reference:</span>
                  <div className="ref-select-wrap">
                    <select
                      className="reference-select"
                      value={referenceLocale}
                      onChange={e => setReferenceLocale(e.target.value)}
                    >
                      {locales.map(code => {
                        const l = SUPPORTED_LOCALES.find(item => item.code === code) || { name: code, flag: '🌐' };
                        return (
                          <option key={code} value={code}>
                            {l.flag} {l.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {referenceLocale !== selectedEditingLocale && (
                  <button
                    className="btn-copy-all"
                    onClick={handleCopyAllFromReference}
                    title="Clone reference text to all slides"
                  >
                    {copiedAll ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedAll ? 'All Copied!' : 'Copy All from Ref'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Slides Translation Cards List */}
            <div className="workspace-slides-list">
              {scenes.map((scene, idx) => {
                const refHeadline = scene.headlines?.[referenceLocale] || scene.headlines?.['en-US'] || '';
                const refSubhead = scene.subheads?.[referenceLocale] || scene.subheads?.['en-US'] || '';
                const targetHeadline = scene.headlines?.[selectedEditingLocale] || '';
                const targetSubhead = scene.subheads?.[selectedEditingLocale] || '';
                const isCopied = copiedSlideId === scene.id;

                return (
                  <div key={scene.id} className="slide-translation-box">
                    <div className="slide-box-header">
                      <div className="slide-badge-wrap">
                        <span className="slide-pill">Slide {idx + 1}</span>
                        <span className="layout-badge">{scene.layout || 'Classic'}</span>
                      </div>

                      {referenceLocale !== selectedEditingLocale && (
                        <button
                          className={`btn-copy-slide ${isCopied ? 'copied' : ''}`}
                          onClick={() => handleCopyFromReference(scene.id)}
                          title="Copy reference text to this slide"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{isCopied ? 'Copied' : 'Copy from Ref'}</span>
                        </button>
                      )}
                    </div>

                    <div className={`slide-box-body ${referenceLocale !== selectedEditingLocale ? 'has-reference' : 'single-column'}`}>
                      {/* Reference Preview Column */}
                      {referenceLocale !== selectedEditingLocale && (
                        <div className="reference-preview-column">
                          <div className="ref-preview-label">
                            <BookOpen size={12} />
                            <span>Reference ({refLocaleInfo.name})</span>
                          </div>
                          <div className="ref-preview-content" dir={isRefRtl ? 'rtl' : 'ltr'}>
                            <p className="ref-headline-preview">
                              {refHeadline || <span className="empty-text">No reference headline</span>}
                            </p>
                            <p className="ref-subhead-preview">
                              {refSubhead || <span className="empty-text">No reference subtitle</span>}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Target Language Translation Inputs Column */}
                      <div className="target-inputs-column">
                        <div className="input-group">
                          <label className="input-label">
                            Headline ({currentLocaleInfo.code})
                          </label>
                          <input
                            type="text"
                            dir={isRtl ? 'rtl' : 'ltr'}
                            placeholder="Enter catchy headline..."
                            value={targetHeadline}
                            onChange={e => onUpdateSceneText(scene.id, selectedEditingLocale, 'headline', e.target.value)}
                            className="text-input full-width-input"
                          />
                        </div>

                        <div className="input-group mt-3">
                          <label className="input-label">
                            Subhead / Feature Description ({currentLocaleInfo.code})
                          </label>
                          <textarea
                            dir={isRtl ? 'rtl' : 'ltr'}
                            rows={2}
                            placeholder="Add a subtitle highlighting your best features..."
                            value={targetSubhead}
                            onChange={e => onUpdateSceneText(scene.id, selectedEditingLocale, 'subhead', e.target.value)}
                            className="textarea-input full-width-textarea"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-footer-info">
            <Globe size={16} className="text-indigo-400" />
            <span>Exporting as ZIP will generate individual localized folders for each language automatically.</span>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
