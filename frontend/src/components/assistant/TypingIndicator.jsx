import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="chat-bubble chat-bubble-bot" style={{ padding: '8px 16px', maxWidth: 'fit-content' }}>
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
