import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const statuses = [
  "Analyzing document content...",
  "Extracting key details...",
  "Processing complaint information...",
  "Running AI analysis...",
  "Finalizing extraction..."
];

const ExtractionProgress = () => {
  const { extractionProgress } = useSelector((state) => state.chat);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '0 24px 16px 24px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '8px' }}>
        EXTRACTION PROGRESS
      </div>
      <div className="progress-bar-container" style={{ marginBottom: '8px' }}>
        <div className="progress-bar-fill" style={{ width: `${extractionProgress}%` }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{statuses[statusIndex]}</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{extractionProgress}%</span>
      </div>
    </div>
  );
};

export default ExtractionProgress;
