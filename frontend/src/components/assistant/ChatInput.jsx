import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setLoading, setIsExtracting, setExtractionProgress } from '../../features/chat/chatSlice';
import { sendChatMessage, extractDocument } from '../../services/api';
import { applyAIResponse } from '../../utils/ai';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ChatInput = () => {
  const [text, setText] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const dispatch = useDispatch();
  const { threadId, isLoading } = useSelector((state) => state.chat);
  const { fields, duplicates } = useSelector((state) => state.complaint);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = async () => {
    if ((!text.trim() && !pendingFile) || isLoading) return;

    // If there's a pending file, upload it
    if (pendingFile) {
      const file = pendingFile;
      setPendingFile(null);
      setText('');

      dispatch(setIsExtracting(true));
      dispatch(setExtractionProgress(0));

      const interval = setInterval(() => {
        dispatch(setExtractionProgress((prev) => Math.min(prev + 10, 90)));
      }, 200);

      try {
        const data = await extractDocument({
          file,
          threadId,
          currentFields: fields,
          existingComplaints: duplicates
        });
        clearInterval(interval);
        dispatch(setExtractionProgress(100));
        applyAIResponse(dispatch, data);
      } catch (error) {
        clearInterval(interval);
        console.error(error);
        dispatch(addMessage({
          role: 'bot',
          content: 'Sorry, there was an error processing your document.',
          timestamp: new Date().toISOString()
        }));
      } finally {
        setTimeout(() => dispatch(setIsExtracting(false)), 500);
      }
      return;
    }

    // Otherwise send text message
    const msg = text.trim();
    setText('');

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
      dispatch(addMessage({ role: 'bot', content: 'Sorry, I encountered an error.', timestamp: new Date().toISOString() }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) {
      setPendingFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'message/rfc822': ['.eml']
    },
    noClick: true,
    noKeyboard: true
  });

  return (
    <div className="chat-input-area" {...getRootProps()}>
      <input {...getInputProps()} />
      {pendingFile && (
        <div className="chat-file-pill">
          <FileText size={14} />
          <span>{pendingFile.name}</span>
          <button className="chat-file-remove" onClick={() => setPendingFile(null)} title="Remove file">
            <X size={12} />
          </button>
        </div>
      )}
      <div className="chat-input-wrapper">
        <button
          className="chat-attach-btn"
          onClick={open}
          title="Attach document (PDF, DOCX, TXT, EML)"
          type="button"
        >
          <Paperclip size={18} />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pendingFile ? 'Press send to upload file, or type a message...' : 'Ask me anything or paste complaint text...'}
          disabled={isLoading}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={(!text.trim() && !pendingFile) || isLoading}>
          <Send size={18} />
        </button>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '8px' }}>
        AI responses may contain errors. Please verify information.
      </div>
    </div>
  );
};

export default ChatInput;
