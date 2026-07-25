import React from 'react';
import { useSelector } from 'react-redux';
import { Copy } from 'lucide-react';

const DuplicatesPanel = () => {
  const { duplicates } = useSelector((state) => state.complaint);

  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="info-panel">
      <div className="info-panel-header">🔁 Similar Complaints Detected</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {duplicates.map((dup, idx) => {
          const simColor = dup.similarity > 80 ? 'var(--color-critical)' : dup.similarity > 60 ? 'var(--color-warning)' : 'var(--color-primary)';
          const simBg = dup.similarity > 80 ? 'var(--color-critical-bg)' : dup.similarity > 60 ? 'var(--color-major-bg)' : 'var(--color-primary-light)';
          
          return (
            <div key={idx} style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-alt)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{dup.product_name} {dup.batch_number ? `(Batch: ${dup.batch_number})` : ''}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{dup.customer_name}</div>
                </div>
                <span className="badge" style={{ background: simBg, color: simColor, borderColor: simColor }}>
                  {dup.similarity}% Match
                </span>
              </div>
              {dup.reason && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <Copy size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{dup.reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DuplicatesPanel;
