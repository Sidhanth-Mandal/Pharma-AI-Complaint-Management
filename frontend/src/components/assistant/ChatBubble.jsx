import React from 'react';

const ChatBubble = ({ message }) => {
  const { role, content, timestamp } = message;
  const isBot = role === 'bot';

  return (
    <div className={`chat-bubble chat-bubble-${isBot ? 'bot' : 'user'}`}>
      <div>{content}</div>
      {timestamp && (
        <div className="chat-timestamp" style={{ color: isBot ? 'var(--color-muted)' : 'rgba(255,255,255,0.7)' }}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
