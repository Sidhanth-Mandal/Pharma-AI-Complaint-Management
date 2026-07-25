import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setLoading } from '../../features/chat/chatSlice';
import { sendChatMessage } from '../../services/api';
import { applyAIResponse } from '../../utils/ai';

const PasteArea = () => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const { threadId } = useSelector((state) => state.chat);
  const { fields, duplicates } = useSelector((state) => state.complaint);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text;
    setText('');
    setExpanded(false);

    dispatch(addMessage({ role: 'user', content: msg, timestamp: new Date().toISOString() }));
    dispatch(setLoading(true));

    try {
      const data = await sendChatMessage({
        threadId,
        message: msg,
        currentFields: fields,
        existingComplaints: duplicates
      });
      applyAIResponse(dispatch, data);
    } catch (error) {
      console.error(error);
      dispatch(addMessage({ role: 'bot', content: 'An error occurred while analyzing the text.', timestamp: new Date().toISOString() }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div style={{ padding: '0 24px 16px 24px' }}>
      <button 
        className="btn btn-secondary" 
        style={{ width: '100%' }}
        onClick={() => setExpanded(!expanded)}
      >
        📋 Paste Complaint Text / Email
      </button>
      {expanded && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            className="form-control"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste email content or text here..."
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Supports plain text, email threads</span>
            <button className="btn btn-primary" onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasteArea;
