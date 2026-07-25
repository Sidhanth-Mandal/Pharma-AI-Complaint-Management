import React from 'react';
import { useSelector } from 'react-redux';
import { Activity } from 'lucide-react';

const Header = () => {
  const { saveStatus, savedId } = useSelector((state) => state.complaint);

  return (
    <header className="app-header">
      <div className="header-left">
        <Activity size={28} color="var(--color-primary)" />
        <div>
          <div className="header-title">AIVOA</div>
          <div className="header-subtitle">AI Complaint Management &middot; QMS</div>
        </div>
      </div>
      <div></div>
      <div className="header-right">
        {saveStatus === 'saved' ? (
          <span className="badge badge-saved">Saved {savedId ? `#${savedId}` : ''}</span>
        ) : saveStatus === 'saving' ? (
          <span className="badge badge-pending">Saving...</span>
        ) : (
          <span className="badge badge-pending">Pending Triage</span>
        )}
      </div>
    </header>
  );
};

export default Header;
