import React from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle } from 'lucide-react';

const CompletenessPanel = () => {
  const { completeness } = useSelector((state) => state.complaint);
  const { score, missing = [] } = completeness;

  if (score <= 0) return null;

  const color = score >= 90 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-critical)';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="info-panel">
      <div className="info-panel-header">📊 Complaint Completeness</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className="completeness-ring" style={{ position: 'relative' }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle className="completeness-circle-bg" cx="40" cy="40" r={radius} />
            <circle
              className="completeness-circle"
              cx="40"
              cy="40"
              r={radius}
              style={{ strokeDasharray: circumference, strokeDashoffset, stroke: color }}
            />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color }}>
            {score}%
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color }}>
              {score >= 90 ? 'Highly Complete' : score >= 40 ? 'Partially Complete' : 'Incomplete'}
            </span>
            {score >= 90 && <CheckCircle size={18} color="var(--color-success)" />}
          </div>
          {missing.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Missing Fields:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {missing.map((field, idx) => (
                  <span key={idx} style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #FECACA' }}>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletenessPanel;
