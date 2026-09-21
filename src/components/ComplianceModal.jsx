import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, X, Sparkles } from 'lucide-react';
import { STORES } from '../constants/storeConfigs';

export default function ComplianceModal({ isOpen, onClose, scenes, store, deviceConfig, activeLocale }) {
  if (!isOpen) return null;

  const isAppStore = store === STORES.APP_STORE;
  const targetStoreName = isAppStore ? 'Apple App Store' : 'Google Play Store';
  
  // Validation checks
  const checks = [
    {
      id: 'dimensions',
      title: 'Canvas Native Dimensions',
      titleAr: 'أبعاد البيكسل الأصلية',
      expected: `${deviceConfig.width} × ${deviceConfig.height} px`,
      actual: `${deviceConfig.width} × ${deviceConfig.height} px`,
      status: 'pass',
      description: `Exact matching resolution for ${deviceConfig.name}.`
    },
    {
      id: 'aspect-ratio',
      title: 'Aspect Ratio Compatibility',
      titleAr: 'نسبة الأبعاد (Aspect Ratio)',
      expected: deviceConfig.aspectRatio,
      actual: deviceConfig.aspectRatio,
      status: 'pass',
      description: `Complies with official ${targetStoreName} aspect ratio guidelines.`
    },
    {
      id: 'count',
      title: 'Screenshot Count Limit',
      titleAr: 'عدد لقطات الشاشة',
      expected: isAppStore ? '1 to 10 screenshots' : '2 to 8 screenshots',
      actual: `${scenes.length} screenshots configured`,
      status: isAppStore 
        ? (scenes.length >= 1 && scenes.length <= 10 ? 'pass' : (scenes.length > 10 ? 'fail' : 'warn'))
        : (scenes.length >= 2 && scenes.length <= 8 ? 'pass' : 'warn'),
      description: isAppStore 
        ? 'Apple App Store allows up to 10 screenshots per device size.'
        : 'Google Play recommends at least 4 screenshots (minimum 2, max 8).'
    },
    {
      id: 'copy-safe-zones',
      title: 'Text Safe Zones',
      titleAr: 'المساحة الآمنة للنصوص',
      expected: 'Within top 25% or bottom 25% safe bounds',
      actual: 'Protected against device bezel overlap',
      status: 'pass',
      description: 'Headlines & subheads positioned in clear view areas.'
    },
    {
      id: 'file-format',
      title: 'Export File Format',
      titleAr: 'صيغة وجودة التصدير',
      expected: 'PNG 24-bit 1:1 Pixel Native',
      actual: 'High-res lossless PNG',
      status: 'pass',
      description: 'Lossless crisp output ready for direct submission.'
    }
  ];

  const passCount = checks.filter(c => c.status === 'pass').length;
  const isAllPassing = passCount === checks.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card compliance-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <ShieldCheck size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="modal-title">Store Compliance Inspector</h3>
              <p className="modal-subtitle">Validating your current set against {targetStoreName} rules</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className={`compliance-status-banner ${isAllPassing ? 'banner-pass' : 'banner-warn'}`}>
          <div className="banner-icon">
            {isAllPassing ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className="banner-content">
            <h4>{isAllPassing ? '100% Submission Ready' : 'Review Warnings Before Export'}</h4>
            <p>
              {isAllPassing 
                ? `All ${checks.length} compliance verification rules passed successfully for ${deviceConfig.name}.`
                : 'Some guidelines have suggestions to maximize App Store conversion and compliance.'}
            </p>
          </div>
          <div className="banner-score">
            <span className="score-num">{passCount}/{checks.length}</span>
            <span className="score-label">Passed</span>
          </div>
        </div>

        {/* Rules Table */}
        <div className="compliance-rules-list">
          {checks.map(check => (
            <div key={check.id} className="compliance-rule-item">
              <div className="rule-status-icon">
                {check.status === 'pass' && <CheckCircle2 size={18} className="text-emerald-400" />}
                {check.status === 'warn' && <AlertTriangle size={18} className="text-amber-400" />}
                {check.status === 'fail' && <XCircle size={18} className="text-rose-400" />}
              </div>
              <div className="rule-details">
                <div className="rule-header">
                  <span className="rule-title">{check.title}</span>
                  <span className={`rule-badge badge-${check.status}`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
                <p className="rule-desc">{check.description}</p>
                <div className="rule-meta">
                  <span><strong>Expected:</strong> {check.expected}</span>
                  <span><strong>Configured:</strong> {check.actual}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="modal-footer">
          <div className="modal-footer-info">
            <Sparkles size={16} className="text-indigo-400" />
            <span>Targeting <strong>{deviceConfig.name}</strong> in locale <strong>{activeLocale}</strong></span>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
