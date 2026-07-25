import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../features/chat/chatSlice';
import ExtractionProgress from './ExtractionProgress';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import TimelinePanel from '../panels/TimelinePanel';
import { Brain } from 'lucide-react';

const AIPanel = () => {
  const dispatch = useDispatch();
  const { messages, isExtracting } = useSelector((state) => state.chat);

  useEffect(() => {
    if (messages.length === 0) {
      dispatch(addMessage({
        role: 'bot',
        content: "Welcome to AIVOA! I'm your AI Complaint Intake Assistant. You can describe a complaint, paste an email, or upload a document using the 📎 button below. I'll automatically extract the details and maintain the complaint record for you. How can I help?",
        timestamp: new Date().toISOString()
      }));
    }
  }, [messages.length, dispatch]);

  return (
    <>
      <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Brain size={24} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>AI Complaint Intake Assistant</h2>
        <span className="badge badge-blue">BETA</span>
      </div>
      {isExtracting && (
        <div style={{ padding: '0 24px' }}>
          <ExtractionProgress />
        </div>
      )}
      <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
        AI ASSISTANT
      </div>
      <ChatHistory />
      <TimelinePanel />
      <ChatInput />
    </>
  );
};

export default AIPanel;
