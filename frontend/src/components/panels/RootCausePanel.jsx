import React from 'react';
import { useSelector } from 'react-redux';

const RootCausePanel = () => {
  const { rootCauses } = useSelector((state) => state.complaint);

  if (!rootCauses || rootCauses.length === 0) return null;

  return (
    <div className="info-panel">
      <div className="info-panel-header">🔬 Root Cause Analysis</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rootCauses.map((rc, idx) => {
          const confidencePct = Math.round(rc.confidence * 100);
          const barColor = confidencePct > 80 ? 'var(--color-critical)' : confidencePct > 50 ? 'var(--color-warning)' : 'var(--color-primary)';
          
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{idx + 1}. {rc.cause}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: barColor }}>{confidencePct}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${confidencePct}%`, height: '100%', background: barColor, borderRadius: '2px' }}></div>
              </div>
              {rc.explanation && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{rc.explanation}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RootCausePanel;
