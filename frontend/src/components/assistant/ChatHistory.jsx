import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';

const ChatHistory = () => {
  const { messages, isLoading } = useSelector((state) => state.chat);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-container">
      {messages.map((msg, index) => (
        <ChatBubble key={index} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
};

export default ChatHistory;
