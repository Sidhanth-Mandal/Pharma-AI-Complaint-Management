import React from 'react';
import { useSelector } from 'react-redux';

const RiskPanel = () => {
  const { assessment } = useSelector((state) => state.complaint);

  if (!assessment) return null;

  const { severity, priority, confidence, patient_impact, regulatory_concern, suggested_action, investigation_urgency, business_impact } = assessment;

  const severityClass = severity ? `badge-${severity.toLowerCase()}` : '';
  const priorityClass = priority ? `badge-${priority.toLowerCase() === 'urgent' ? 'critical' : priority.toLowerCase() === 'high' ? 'major' : 'minor'}` : '';

  return (
    <div className="info-panel">
      <div className="info-panel-header">⚠️ Risk Assessment</div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {severity && <span className={`badge ${severityClass}`}>Severity: {severity}</span>}
        {priority && <span className={`badge ${priorityClass}`}>Priority: {priority}</span>}
        {confidence && <span className="badge badge-blue">Confidence: {Math.round(confidence * 100)}%</span>}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {[
          { label: 'Patient Impact', value: patient_impact },
          { label: 'Regulatory Concern', value: regulatory_concern },
          { label: 'Investigation Urgency', value: investigation_urgency },
          { label: 'Business Impact', value: business_impact },
          { label: 'Suggested Action', value: suggested_action }
        ].map((item, idx) => item.value ? (
          <div key={idx}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: '0.875rem', marginTop: '2px' }}>{item.value}</div>
          </div>
        ) : null)}
      </div>
    </div>
  );
};

export default RiskPanel;
