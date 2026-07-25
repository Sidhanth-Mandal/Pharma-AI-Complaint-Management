import React from 'react';
import { useSelector } from 'react-redux';
import { CheckSquare } from 'lucide-react';

const CAPAPanel = () => {
  const { capaActions } = useSelector((state) => state.complaint);

  if (!capaActions || capaActions.length === 0) return null;

  return (
    <div className="info-panel">
      <div className="info-panel-header">✅ CAPA Recommendations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {capaActions.map((action, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <CheckSquare size={18} color="var(--color-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CAPAPanel;
