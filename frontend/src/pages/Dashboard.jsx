import React from 'react';
import Header from '../components/layout/Header';
import ComplaintForm from '../components/form/ComplaintForm';
import AIPanel from '../components/assistant/AIPanel';
import CompletenessPanel from '../components/panels/CompletenessPanel';
import RiskPanel from '../components/panels/RiskPanel';
import DuplicatesPanel from '../components/panels/DuplicatesPanel';
import RootCausePanel from '../components/panels/RootCausePanel';
import CAPAPanel from '../components/panels/CAPAPanel';

const Dashboard = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="split-layout">
        <div className="form-panel">
          <ComplaintForm />
          <CompletenessPanel />
          <RiskPanel />
          <DuplicatesPanel />
          <RootCausePanel />
          <CAPAPanel />
        </div>
        <div className="ai-panel">
          <AIPanel />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
