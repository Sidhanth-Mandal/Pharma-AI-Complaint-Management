import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

const TimelinePanel = () => {
  const { timeline } = useSelector((state) => state.complaint);
  const [expanded, setExpanded] = useState(false);

  if (!timeline || timeline.length === 0) return null;

  return (
    <div style={{ padding: '0 24px 16px 24px' }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
          <Clock size={16} color="var(--color-primary)" />
          🕐 Complaint Timeline
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      
      {expanded && (
        <div style={{ marginTop: '16px', paddingLeft: '8px' }}>
          {timeline.map((item, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">{item.event}</div>
              <div className="timeline-time">{new Date(item.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelinePanel;
